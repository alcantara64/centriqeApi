/** 2021-02-10 - Frank - Removed dataAttribute config dependency for search route. This is handeled by the frontend by filtering the globalSearch fields for string only there.  */
import { OracleCloud } from './../../lib/oracle.util';
import mongoose from 'mongoose';
import { getSearchFilterDataBasedOnHoldingOrgConfig } from '../../lib/mongoose.util';
import AServiceBase from "./AServiceBase";
import ICrudService, { SearchQueryOps } from "./ICrudService";
import IServiceBase from "./IServiceBase";

import logger from '../../lib/logger';
import IRowLevelUserSecurity from '../models/IRowLevelUserSecurity';
import IRowLevelSecurityData from '../models/IRowLevelSecurityData';
import security, { QueryLimiter } from '../../lib/security.util';
import HttpUnauthorizedException from '../../exceptions/http/HttpUnauthorizedException';
import HttpNotFoundException from '../../exceptions/http/HttpNotFoundException';
import HttpMethodNotAllowException from '../../exceptions/http/HttpMethodNotAllowException';
import AppUser from '../models/AppUser';
import IRoleBasedUserSecurity from '../models/IRoleBasedUserSecurity';
import Privilege from '../../enums/Privilege';
import search, { Criteria } from '../../lib/search.util';
import DataDomain from '../../enums/DataDomain';
import config from '../../lib/config'
import { HoldingOrgDataAttributeConfig } from '../../models/org/holding-org.types';
import ModelStatus from '../../enums/ModelStatus';

abstract class ACrudService extends AServiceBase implements IServiceBase, ICrudService {

  /**
   * Standard implementation for ICrudService.
   * @param model The mongoose model
   * @param loggerString Returned string will be used to build up logger information. Example "modules.customer.CustomerService"
   * @param grantingPrivileges The granting privileges.
   * @param dataDomain The data domain for this service.
   */
  constructor(protected model: mongoose.Model<any>,
    loggerString: string,
    protected grantingPrivileges: IGrantingPrivileges,
    protected dataDomain: DataDomain) {
    super(loggerString);
  }


  /**
   * Creates one item in the database. Honors user security based on dataDomains
   * @param userSecurity The user's security information.
   * @param payload The json object that comes from the external caller
   */
  public async createOne(appUser: AppUser, payload: any): Promise<any> {
    logger.debug(`${this.loggerString}:createOne::Start`);

    this.isRoleBasedAccessAllowed(appUser, this.grantingPrivileges.createPrivileges);
    if (payload.dataDomainConfig && typeof (payload.dataDomainConfig) === 'string') {
      payload.dataDomainConfig = JSON.parse(payload.dataDomainConfig)
    }

    if (this.isRowLevelSecurityEnabled("createOne")) {
      const securityData = this.extractRowLevelSecurityData(payload);
      this.isRowLevelAccessAllowed(this.dataDomain, appUser, securityData);
    }

    this.attachDataDomainToPayload(payload);

    await this.beforeCreateOne(appUser, payload);
    const newModel = new this.model(payload);
    await this.afterCreateOne(appUser, newModel, payload);
    return await newModel.save();
  }

  /**
   * Creates many items in the database. Honors user security based on dataDomains
   * @param appUser The user's security information.
   * @param payload An array of payloads to be created in the database.
   */
  public async createMany(appUser: AppUser, payload: Array<any>): Promise<any> {
    logger.debug(`${this.loggerString}:createMany::Start`);

    this.isRoleBasedAccessAllowed(appUser, this.grantingPrivileges.createPrivileges);

    if (this.isRowLevelSecurityEnabled("createMany")) {
      const securityData = this.extractRowLevelSecurityData(payload);
      this.isRowLevelAccessAllowed(this.dataDomain, appUser, securityData);
    }

    await this.beforeCreateMany(appUser, payload);
    if (this.restrictModelByDataDomain()) {
      for (let item of payload) {
        this.attachDataDomainToPayload(item);
      }
    }
    const newModels = await this.model.insertMany(payload);
    await this.afterCreateMany(appUser, newModels, payload);
    return newModels;
  }

  /**
   * Reads one item from the database by database ID. Throws exception if user does not have access
   * @param appUser
   * @param id
   */
  public async readOneById(appUser: AppUser, id: string): Promise<any> {
    logger.debug(`${this.loggerString}:readOneById::Start`);

    this.isRoleBasedAccessAllowed(appUser, this.grantingPrivileges.readPrivileges);

    const result = await this.model.findById(id)
      .select(this.getMongooseQuerySelectOptions())
      .populate(this.getMongooseQueryPopulateOptions("readOneById"));

    if (!result) {
      throw new HttpNotFoundException("Object does not exist.");
    }

    if (this.isRowLevelSecurityEnabled("readOneById")) {
      this.isRowLevelAccessAllowed(this.dataDomain, appUser, result);
    }

    this.checkDataDomainOnModel(result);

    return result;
  }


  /**
   * @param appUser
   * @param opts Model attribute names, either single value or array. Example {status = 0} or {status=[0,1]}
   * Strings will be used as a regex. To avoid wildcard for attributes, add an object "disableWildcardFor". Example:
   * disableWildcardFor.code = 1 will avoid wildcard search for the code attribute
   */
  public async readMany(appUser: AppUser, opts: any = {}): Promise<any> {
    logger.info(`${this.loggerString}:readMany::Started`, opts);

    const hrstart = process.hrtime();
    this.isRoleBasedAccessAllowed(appUser, this.grantingPrivileges.readPrivileges);

    //temporarily leaving this in. removing offset and limit eventually
    //readMany will be fixed limited to 1000 records for now
    /** 2021-01-19 - Frank - Extending standard limit to 5000 until UI is adjusted to do server side pagination */
    const { offset = 0, limit = 5000, disableWildcardFor = {}, ...optsQuery } = opts;

    /*
    Commenting out, by default returning active and inactive
    if(optsQuery["status"] === undefined) {
      optsQuery.status = ModelStatus.ACTIVE;
    }
    */

    Object.keys(optsQuery).forEach(function (key) {
      const value = optsQuery[key]
      if (!(value instanceof Array) && isNaN(value)) {
        //convert to regex because we want to do wildcard searches; 'i' is for ignore case

        if (key !== 'memberOrg' && key !== 'holdingOrg' && !disableWildcardFor[key]) {
          optsQuery[key] = new RegExp(value, 'i')
        }
      }
    });

    let securedQuery = {};
    if (this.isRowLevelSecurityEnabled("readMany")) {
      securedQuery = this.attachAccessQuery(optsQuery, this.dataDomain, appUser);
    } else {
      securedQuery = optsQuery;
    }

    securedQuery = this.attachDataDomainModelRestrictionToQuery(securedQuery);

    logger.debug(`${this.loggerString}:readMany::Resulting query`, securedQuery);

    const resultCount = await this.model.countDocuments(securedQuery);
    let sort = this.getSortOrderForReadMany();
    if (!sort) {
      sort = { name: 1, code: 1 }
    }

    const results = await this.model.find(securedQuery)
      .select(this.getMongooseQuerySelectOptions())
      .populate(this.getMongooseQueryPopulateOptions("readMany"))
      .sort(sort)
      .skip(Number(offset))
      .limit(Number(limit));


    const hrend = process.hrtime(hrstart)[1] / 1000000; //time in ms
    logger.info(`${this.loggerString}:readMany::${results.length} records found in ${hrend}ms`);

    return {
      info: {
        offset: offset,
        limit: limit,
        resultCount: results.length,
        totalCount: resultCount,
        queryTime: hrend, //time in ms
        query: securedQuery
      },
      results: results
    };
  }


  public async updateOneById(appUser: AppUser, id: string, payload: any): Promise<any> {
    logger.debug(`${this.loggerString}:updateOneById::Started`);

    this.isRoleBasedAccessAllowed(appUser, this.grantingPrivileges.updatePrivileges);

    if (payload.dataDomainConfig && typeof (payload.dataDomainConfig) === 'string') {
      payload.dataDomainConfig = JSON.parse(payload.dataDomainConfig)
    }
    await this.beforeUpdateOne(appUser, id, payload);

    //this will automatically check for user security
    const result = await this.readOneById(appUser, id);

    await this.beforeUpdateOnePayloadProcessing(appUser, result, id, payload);

    //doesnt work with validators unfortunately. _id is empty which is needed for unique custom validator
    //let result = await User.findByIdAndUpdate(id, payload, {runValidators: true});
    Object.keys(payload).forEach(function (key) {
      result[key] = payload[key]
    });
    await this.afterUpdateOne(appUser, result, id, payload);
    return await result.save();
  }

  /**
   * Raw implementation using this.updateOneById. It may make sense to investigate if there are better ways
   * in mongoose to do that. This function, however, is not likely to be used often.
   * @param userSecurity
   * @param payload
   */
  public async updateMany(appUser: AppUser, payload: Array<any>): Promise<any> {
    logger.debug(`${this.loggerString}:updateMany::Started`);

    this.isRoleBasedAccessAllowed(appUser, this.grantingPrivileges.updatePrivileges);

    const results: any = [];
    for (let item of payload) {
      //also checks each one for security
      results.push(await this.updateOneById(appUser, item.id, item));
    };

    return results;
  }

  public async deleteOneById(appUser: AppUser, id: string): Promise<any> {
    logger.debug(`${this.loggerString}:deleteOneById::Started`);

    this.isRoleBasedAccessAllowed(appUser, this.grantingPrivileges.deletePrivileges);

    //check if user has access on row-level
    await this.readOneById(appUser, id);

    await this.beforeDeleteOne(appUser, id);
    //just done to check for security and if exists.
    const result = await this.model.findByIdAndDelete(id);
    return result;
  }


  /**
   * Standard implementation returns null.
   * This can be used to sepcifically exclude fields. For example, "-password" would exclude the password field.
   */
  protected getMongooseQuerySelectOptions(): string | null {
    return null;
  }

  /**
   * Standard implementation returns null.
   * This can be used to sepcifically load fields. For example, "roles" for users.
   */
  protected getMongooseQueryPopulateOptions(methodName: "readOneById" | "readMany"): string | null | Array<Object> {
    return null;
  }

  /**
   * Search resource with queryOptions. Can only be used if getFieldNamesForSearch() is implemented.
   * @param appUser
   * @param queryOpts
   */
  public async searchByFilterCriteria(appUser: AppUser, queryOpts: any): Promise<any> {
    logger.debug(`${this.loggerString}:searchByFilterCriteria::Started`, queryOpts);

    const { filter = {}, orgLimiter = {} } = queryOpts.queryByCriteria;
    const { criteria = [] } = filter


    const query = this.convertCriteriaToMongooseQueryAndAttachOrgLimiter(criteria, orgLimiter, [ModelStatus.ACTIVE]);

    logger.info(`${this.loggerString}:searchByFilterCriteria::Resulting query`, query);

    const results = this.searchByQuery(
      appUser,
      {
        options: queryOpts.options,
        query: query
      }
    );

    return results;
  }

  /**
   * Can be overriden if needed. See ACampaignService
   * @param criteria
   * @param orgLimiter
   * @param modelStatus
   */
  protected convertCriteriaToMongooseQueryAndAttachOrgLimiter(criteria: Criteria, orgLimiter: QueryLimiter, modelStatus?: ModelStatus[]): any {
    return search.convertCriteriaToMongooseQueryAndAttachOrgLimiter(criteria, orgLimiter, [ModelStatus.ACTIVE])
  }

  /**
   * Search by mongoose query
   * @param appUser
   * @param queryOpts
   * @param mongooseOptions override default mongoose options for select and popoulate
   */
  public async searchByQuery(appUser: AppUser, queryOpts: SearchQueryOps, mongooseOptions?: {select?: string, populate?: any}): Promise<any> {
    logger.debug(`${this.loggerString}:searchByQuery::Started`, { appUser: appUser, queryOpts: queryOpts });

    const hrstart = process.hrtime();

    this.isRoleBasedAccessAllowed(appUser, this.grantingPrivileges.readPrivileges);

    const { options, query } = queryOpts;
    let securedQuery = {};
    if (this.isRowLevelSecurityEnabled("searchByQuery")) {
      securedQuery = this.attachAccessQuery(query, this.dataDomain, appUser);
    } else {
      securedQuery = query;
    }

    securedQuery = this.attachDataDomainModelRestrictionToQuery(securedQuery)

    logger.info(`${this.loggerString}:searchByQuery::Secured query`, { securedQuery: securedQuery });

    /**2021-02-01 Creating Mongoose Query for Dynamic Search facility */
    let searchQuery: any = {};
    let mergeQuery: any = { "$and": [] };

    if (options.globalSearch) {
      const { fieldNames = [], searchValue = "" } = options.globalSearch;
      let qArr: any = [];
      fieldNames.forEach(function (fieldName) {
        /** 2021-02-10 - Frank - Removed dataAttributeMap check again to make this route more generic.
         * This means, the customer list will have to honor the check for string and only pass those fields for global search
        */
        qArr.push({ [fieldName]: { $regex: searchValue, $options: 'i' } });
      });

      mergeQuery.$and.push(securedQuery)
      if (qArr.length > 0) {
        searchQuery.$or = qArr;
        mergeQuery.$and.push(searchQuery)
      }
      /**2021-02-01 Generating new merged query (securedquery + searchQuery) */

      /**2021-02-01 End of merged query (securedquery + searchQuery) generation*/
    } else {
      mergeQuery.$and.push(securedQuery)
    }
    logger.info(`${this.loggerString}:searchByQuery::merge query`, { mergeQuery });
    /**2021-02-01 End of Creating Mongoose Query for Dynamic Search facility */

    /** 2021-01-19 - Frank - Extending standard limit to 5000 until UI is adjusted to do server side pagination */
    const { offset = 0, limit = 5000 } = options;
    const selectOptions = this.getMongooseQuerySelectOptions();

    const resultCount = await this.model.countDocuments(mergeQuery);

    const results = await this.model.find(mergeQuery)
      .lean()
      .select(mongooseOptions?.select || selectOptions)
      .populate(mongooseOptions?.populate)
      .skip(Number(offset))
      .limit(Number(limit))
      .sort(options.sort);

    const hrend = process.hrtime(hrstart)[1] / 1000000; //time in ms
    logger.info(`${this.loggerString}:searchByQuery::${results.length} records found in ${hrend}ms`);
    return {
      info: {
        offset: offset,
        limit: limit,
        resultCount: results.length,
        totalCount: resultCount,
        queryTime: hrend, //time in ms
        query: mergeQuery
      },
      results: results
    };

  }

  /**
   * Provides campaign search filters based on holding org configuration.
   * getHoldingOrgAttributeConfig(..) needs to be implemented
   * @param appUser
   * @param holdingOrgId
   */
  async getSearchFilterDataBasedOnConfig(appUser: AppUser, holdingOrgId: string) {
    //fetch holding org attribute configuration
    const dataAttributes = await this.getHoldingOrgAttributeConfig(appUser, holdingOrgId);
    //retrieve search filter data for dynamic providers (unique data per dynamic attribute)
    return await getSearchFilterDataBasedOnHoldingOrgConfig(this.model, dataAttributes, this.dataDomain, appUser);
  }

  /**
   * Needs to be implemented to enable getSearchFilterDataBasedOnConfig(..)
   * @param appUser
   * @param holdingOrgId
   */
  protected async getHoldingOrgAttributeConfig(appUser: AppUser, holdingOrgId: string): Promise<HoldingOrgDataAttributeConfig[]> {
    throw new HttpMethodNotAllowException("This method is not implemented for this resource.");
  }

  /**
   * Default implementation.
   * If returns true, then it will automatically extract and check for row level security (holdingOrg and memberOrg).
   * If returns false, standard row level security checks are disabled.
   *
   * @param methodName the calling method name
   */
  protected isRowLevelSecurityEnabled(methodName: string): boolean {
    return true;
  }


  /**
   * Throws an HttpUnauthorizedException if user doesnt have access. There is no return value.
   * Uses lib.security.isRowLevelAccessAllowed
   * @param userSecurity
   * @param securityData
   */
  protected isRowLevelAccessAllowed(dataDomain: DataDomain, userSecurity: IRowLevelUserSecurity, securityData: IRowLevelSecurityData | IRowLevelSecurityData[]): void {
    const isAllowed = security.isRowLevelAccessAllowed(dataDomain, userSecurity, securityData);
    if (!isAllowed) {
      throw new HttpUnauthorizedException('You do not have access to this resource.');
    }
  }

  /**
   * This assumes that the model has attributes memberOrg and holdingOrg. If necessary, this can be overwritten in implementing class.
   * Uses lib.security.attachAccessQueryRestriction
   * @param query mongoose query
   * @param userSecurity
   */
  protected attachAccessQuery(query: any, dataDomain: DataDomain, userSecurity: IRowLevelUserSecurity): any {
    const securedQuery = security.attachAccessRestrictionToQuery(query, dataDomain, userSecurity);
    return securedQuery;
  }


  /**
   * This assumes that the model has attributes memberOrg and holdingOrg. If necessary, this can be overwritten in implementing class.
   * Uses lib.security.extractRowLevelSecurityData
   * @param data Payload for the mongoose model.
   */
  protected extractRowLevelSecurityData(data: any): IRowLevelSecurityData[] {
    const results = security.extractRowLevelSecurityData(data);
    return results;
  }


  /**
   * Throws HttpUnauthorizedException if no access.
   * Uses lib.security.isRoleBasedAccessAllowed
   * @param roleSecurity The user's role security.
   * @param grantingPrivileges The list of privileges that grant access to this endpoint.
   */
  protected isRoleBasedAccessAllowed(roleSecurity: IRoleBasedUserSecurity, grantingPrivileges: Array<Privilege>): void {
    const isAllowed = security.isRoleBasedAccessAllowed(roleSecurity, grantingPrivileges);
    if (!isAllowed) {
      logger.info(`${this.loggerString}:isRoleBasedAccessAllowed::User has no access`, { roleSecurity: roleSecurity, grantingPrivileges: grantingPrivileges })
      throw new HttpUnauthorizedException('Your role does not allow access to this resource.');
    }
  }

  /**
   * Empty implementation. Can be overwritten in child class.
   * @param appUser The current appUser
   * @param newModel The new model instance that was created.
   * @param payload The payload.
   */
  protected async afterCreateOne(appUser: AppUser, newModel: any, payload: any): Promise<void> { }

  /**
   * Empty implementation. Can be overwritten in child class.
   * @param appUser The current appUser
   * @param newModel The new model instances that were created.
   * @param payload The payload.
   */
  protected async afterCreateMany(appUser: AppUser, newModels: Array<any>, payload: Array<any>): Promise<void> { }

  /**
   * Empty implementation. Can be overwritten in child class.
   * Note: There is no afterUpdateMany, because updateMany calls updateOne
   * @param appUser
   * @param updatedModel
   * @param id
   * @param payload
   */
  protected async afterUpdateOne(appUser: AppUser, updatedModel: any, id: string, payload: any): Promise<void> { }


  /**
   * Model not yet updated, but data fetched from database
   * @param appUser
   * @param notYetUpdatedModel
   * @param id
   * @param payload
   */
  protected async beforeUpdateOnePayloadProcessing(appUser: AppUser, notYetUpdatedModel: any, id: string, payload: any): Promise<void> { }


  /**
   * Provide the sort order for readMany
   */
  protected getSortOrderForReadMany(): any {
    return undefined;
  }



  /**
   * Empty implementation. Can be overwritten in child class.
   * @param appUser The current appUser
   * @param payload The payload.
   */
  protected async beforeCreateOne(appUser: AppUser, payload: any): Promise<void> { }

  /**
   * Empty implementation. Can be overwritten in child class.
   * @param appUser The current appUser
   * @param payload The payload.
   */
  protected async beforeCreateMany(appUser: AppUser, payload: Array<any>): Promise<void> { }

  /**
   * Empty implementation. Can be overwritten in child class.
   * Note: There is no afterUpdateMany, because updateMany calls updateOne
   * @param appUser
   * @param id
   * @param payload
   */
  protected async beforeUpdateOne(appUser: AppUser, id: string, payload: any): Promise<void> { }

  protected async beforeDeleteOne(appUser: AppUser, id: string): Promise<void> { }

  /**
   * Can be used to filter the Model data for specific fields.
   * Example use: EmailTemplateService uses MessageTemplateModel where dataDomain = "communication"
   * Standard implementation returns null.
   */
  protected restrictModelByDataDomain(): boolean {
    return false;
  }


  /**
   * Will attach dataDomain: this.dataDomain with $and if this.restrictModelByDataDomain() returns true.
   * This can be be used if the Model class is used by different services with different dataDomains. For example MessageTemplateModel
   * @param query
   */
  protected attachDataDomainModelRestrictionToQuery(query: any) {
    let extendedQuery = query;
    if (this.restrictModelByDataDomain()) {
      extendedQuery = security.attachQueryToQuery(query, { dataDomain: this.dataDomain }, "$and");
    }
    return extendedQuery;
  }

  /**
   * Will add payload.dataDomain = this.dataDomain if this.restrictModelByDataDomain() returns true.
   * This can be be used if the Model class is used by different services with different dataDomains. For example MessageTemplateModel
   * @param payload
   */
  protected attachDataDomainToPayload(payload: any): void {
    if (this.restrictModelByDataDomain()) {
      payload["dataDomain"] = this.dataDomain;
    }
  }

  /**
   * Throws a HttpUnauthorizedException if service implementation has "restrictModelByDataDomain" active
   * and model.dataDomain !== this.dataDomain
   * @param model
   */
  protected checkDataDomainOnModel(model: any): void {
    if (this.restrictModelByDataDomain()) {

      if (model.dataDomain !== this.dataDomain) {
        throw new HttpUnauthorizedException('You do not have access to this resource.');
      }
    }
  }


  /**
   *
   * @param payload
   * @param fileNameInBucketNoExtension The new file name without the file extension
   */
  protected async uploadFile(payload: any, fileNameInBucketNoExtension: string, bucketFolder: string): Promise<FileUploadResult> {
    if (payload.fileName) {
      let fileName: string = payload.fileName;
      logger.debug(`${this.loggerString}:uploadFile::Start - fileName ${fileName}`);
      const oracleCloud = new OracleCloud();

      //replace fileName with new fileName while keeping the file extension
      const indexOfItem = fileName.indexOf('/');
      fileName = fileName.substring(indexOfItem + 1);
      const lastIndexOfDot = fileName.lastIndexOf(".");
      if (lastIndexOfDot > 0) {
        const fileExtension = fileName.substring(lastIndexOfDot + 1, fileName.length);
        logger.debug(`${this.loggerString}:uploadFile::File extension ${fileExtension}`);
        fileName = `${fileNameInBucketNoExtension}.${fileExtension}`
      }

      const imageName = `${config.oracleCloud.bucketFolder}/${bucketFolder}/${fileName}`;
      logger.debug(`${this.loggerString}:uploadFile::Image name ${imageName}`);

      await oracleCloud.uploadToBucket(config.oracleCloud.bucketName, imageName, payload.fileName);
      const url = `${config.oracleCloud.objectStorageURL}/${config.oracleCloud.bucketName}/o/${imageName}`
      logger.debug(`${this.loggerString}:uploadFile::Logo url ${url}`);

      delete payload.fileName;
      return {
        wasFileUploaded: true,
        bucketUrlToFile: url
      };
    }

    return {
      wasFileUploaded: false
    };
  }

}

export default ACrudService


interface IGrantingPrivileges {
  createPrivileges: Array<Privilege>;
  readPrivileges: Array<Privilege>;
  updatePrivileges: Array<Privilege>;
  deletePrivileges: Array<Privilege>;
}

export {
  IGrantingPrivileges
}

export type FileUploadResult = {
  wasFileUploaded: boolean,
  bucketUrlToFile?: string
}
