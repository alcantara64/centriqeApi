import AppUser from '../../interfaces/models/AppUser';
import DataDomain from '../../enums/DataDomain';
import ModelStatus from '../../enums/ModelStatus';
import Privilege from '../../enums/Privilege';
import AppException from '../../exceptions/AppException';
import ACrudService from '../../interfaces/services/ACrudService';
import ICrudService from '../../interfaces/services/ICrudService';
import IServiceBase from '../../interfaces/services/IServiceBase';
import logger from '../../lib/logger';
import HoldingOrgModel from '../../models/org/holding-org.model';
import { HoldingOrgDataAttributeConfigDocument, HoldingOrgDocument } from '../../models/org/holding-org.types';
import { UserDocument } from '../../models/user/user.types';
import MemberOrgService from '../member-org/MemberOrgService';

class HoldingOrgService extends ACrudService implements IServiceBase, ICrudService {
  static LOGO_FOLDER_NAME: string = "logos"
  private memberOrgService: MemberOrgService;

  constructor() {
    super(
      HoldingOrgModel,
      'modules.customer.HoldingOrgService',
      {
        createPrivileges: [Privilege.CLIENT_SETUP_EDIT],
        readPrivileges: [Privilege.CLIENT_SETUP_VIEW, Privilege.CLIENT_SETUP_EDIT],
        updatePrivileges: [Privilege.CLIENT_SETUP_EDIT],
        deletePrivileges: [Privilege.CLIENT_SETUP_EDIT]
      },
      DataDomain.NONE
    );

    this.memberOrgService = new MemberOrgService();
  }


  protected async beforeCreateOne(appUser: AppUser, payload: any): Promise<void> {
    //the file name should be the holding org code which is unique
    const result = await this.uploadFile(payload, payload.code, HoldingOrgService.LOGO_FOLDER_NAME);
    if (result.wasFileUploaded && result.bucketUrlToFile) {
      (<string>payload.logoUrl) = result.bucketUrlToFile
    }

  }

  protected async beforeUpdateOnePayloadProcessing(appUser: AppUser, notYetUpdatedModel: any, id: string, payload: any): Promise<void> {
    //the file name should be the holding org code which is unique
    const result = await this.uploadFile(payload, notYetUpdatedModel.code, HoldingOrgService.LOGO_FOLDER_NAME);
    if (result.wasFileUploaded && result.bucketUrlToFile) {
      (<string>payload.logoUrl) = result.bucketUrlToFile
    }
  }



  protected async afterUpdateOne(appUser: AppUser, updatedModel: any, id: string, payload: any): Promise<void> {
    const { _id, subscribedModuleCodes } = <HoldingOrgDocument>updatedModel
    await this.memberOrgService.updateMemberOrgSubscriptionsByHoldingOrgId(_id, subscribedModuleCodes);
  }


  /**
   * Overwrite
   */
  protected isRowLevelSecurityEnabled(methodName: string): boolean {
    return false;
  }


  /**
   * No security check. Supposed to be used only internally for authentication routes!
   * @param id Find holdingOrg by database id.
   */
  public async findHoldingOrgById(id: string): Promise<HoldingOrgDocument | null> {
    return await HoldingOrgModel.findById(id);
  }

  /**
   * No security check. Supposed to be used only internally for authentication routes!
   * @param code Find holdingOrg by code.
   */
  public async findHoldingOrgByCode(code: string): Promise<any> {
    if (code) {
      code = code.toUpperCase();
    }
    return await HoldingOrgModel.findOne({ code });
  }

  /**
   * No security check. Supposed to be used only internally for authentication routes!
   * @param id Find holdingOrg by database id.
   */
  public async findActiveHoldingOrgByIdLean(id: string): Promise<any> {
    const results = await HoldingOrgModel.find({
      $and: [
        { _id: id },
        { status: ModelStatus.ACTIVE }
      ]
    });

    const result = results.length > 0 ? results[0] : null;
    return result;
  }

  /**
   * This is exclusively for the global holdingOrg selector
   * @param holdingOrgId
   */
  public async findOneHoldingOrgsForUserGlobalHoldingOrgSelection(holdingOrgId: string) {
    logger.debug(`${this.loggerString}:findOneHoldingOrgsForUserGlobalHoldingOrgSelection::Start`);

    let query: any = {
      status: ModelStatus.ACTIVE
    }

    query = {
      $and: [
        query,
        { _id: holdingOrgId }
      ]
    }

    const holdingOrgs: HoldingOrgDocument[] = await this.model.find(query).lean();
    let holdingOrg = {};
    if (holdingOrgs.length > 0) {

      holdingOrg = {
        _id: holdingOrgs[0]._id,
        code: holdingOrgs[0].code,
        name: holdingOrgs[0].name,
        logoUrl: holdingOrgs[0].logoUrl,
        dataDomainConfig: holdingOrgs[0].dataDomainConfig,
        dataConfig: {}
      }

    }
    return { holdingOrg };
  }


  /**
   * This is exclusively for the global holdingOrg selector
   * @param user
   */
  public async findAllHoldingOrgsForUserGlobalHoldingOrgSelection(user: UserDocument, holdingOrgCode?: string) {
    logger.debug(`${this.loggerString}:findAllHoldingOrgsForUserGlobalHoldingOrgSelection::Start`);

    let query: any = {
      $and: [
        { status: ModelStatus.ACTIVE }
      ]
    }

    if (!user.isAdmin) {
      //if user is not an admin, check all holdingOrgIds
      const holdingOrgIds: Array<string> = user.getHoldingOrgsForGlobalSelector();

      query.$and.push({ _id: holdingOrgIds });
    }

    if (holdingOrgCode) {
      query.$and.push({ code: holdingOrgCode })
    }

    //get all holdingOrgIds
    //TODO: This does not scale to unlimited holding orgs. Not only due to possibly large amount of data,
    //but also due to $in query cannot have unlimited number of elements
    const holdingOrgs: HoldingOrgDocument[] = await this.model.find(query).sort('name').lean();

    const holdingOrgList = [];
    let holdingOrg;

    if (holdingOrgs.length > 0) {
      holdingOrg = {
        _id: holdingOrgs[0]._id,
        code: holdingOrgs[0].code,
        name: holdingOrgs[0].name,
        logoUrl: holdingOrgs[0].logoUrl,
        dataDomainConfig: holdingOrgs[0].dataDomainConfig,
        dataConfig: {}
      }

      for (let holdingOrg of holdingOrgs) {
        holdingOrgList.push({
          _id: holdingOrg._id,
          code: holdingOrg.code,
          name: holdingOrg.name,
          logoUrl: holdingOrg.logoUrl
        });
      }
    }
    return { holdingOrg, holdingOrgList };
  }

  /**
   * Retrieve dataAttribute configuration for the specified resource.
   * No security check for now. It anyway does not include only configuration data.
   * @param appUser
   * @param dataDomain
   * @param holdingOrgId
   * @param dataConfigResource dataConfig.${dataConfigResource}.dataAttributes
   */
  public async getAttributeConfig(holdingOrgId: string, dataConfigResource: "customer"): Promise<HoldingOrgDataAttributeConfigDocument[]> {
    const holdingOrg = await HoldingOrgModel.findById(holdingOrgId)
      .select(`dataConfig.${dataConfigResource}.dataAttributes`)
      .lean()

    if (!holdingOrg) {
      throw new AppException("HoldingOrg does not exist " + holdingOrgId)
    }

    let result: HoldingOrgDataAttributeConfigDocument[] = []
    //check is necessary because during transition phase, there may be holding orgs that dont have a data config
    if (holdingOrg.dataConfig && holdingOrg.dataConfig[dataConfigResource]) {
      result = <HoldingOrgDataAttributeConfigDocument[]>holdingOrg.dataConfig[dataConfigResource].dataAttributes
    }

    return result
  }

  /**
  * Get the DashBoard config for provided holdingOrg
  * @param holdingOrg
  */
  public async findHoldingOrgsDashboardConfig(holdingOrg: string) {
    logger.debug(`${this.loggerString}:findHoldingOrgsDashboardConfig::Start`);

    let query: any = {
      status: ModelStatus.ACTIVE
    }

    query = {
      $and: [
        query,
        { _id: holdingOrg }
      ]
    }

    const holdingOrgDashboardConfig: HoldingOrgDocument = await this.model.findOne(query, { _id: 0, dashboardConfig: 1 }).lean();

    return { holdingOrgDashboardConfig };
  }

  public async findHoldingOrgTags() {
    logger.debug(`${this.loggerString}:findHoldingOrgTags::Start`);


    const aggregationPipeline = [
      {
        '$match': {
          '$and': [
            {
              'orgTags': {
                '$ne': null
              }
            },
            { 'status': ModelStatus.ACTIVE }
          ]

        }
      }, {
        '$project': {
          'orgTags': 1
        }
      }, {
        '$unwind': {
          'path': '$orgTags',
          'preserveNullAndEmptyArrays': false
        }
      }, {
        '$group': {
          '_id': '$orgTags'
        }
      }, {
        '$sort': {
          '_id': 1
        }
      }
    ]


    const tags: any[] = await HoldingOrgModel.aggregate(aggregationPipeline);

    return tags.map(a => a._id);
  }


  public async findOrgByTagsLean(tags: string) {
    logger.debug(`${this.loggerString}:findHoldingOrgTags::Start`, { tags });


    const holdingOrgs = await (<any>HoldingOrgModel).find({
      status: ModelStatus.ACTIVE,
      orgTags: { $in: tags }
    }).lean();

    return holdingOrgs;
  }

}


export default HoldingOrgService
