import _ from 'lodash';
import HttpObjectNotFoundException from '../../exceptions/http/HttpObjectNotFoundException';
import Privilege from '../../enums/Privilege';
import AppException from '../../exceptions/AppException';
import HttpMethodNotAllowedException from '../../exceptions/http/HttpMethodNotAllowException';
import HttpUnauthorizedException from '../../exceptions/http/HttpUnauthorizedException';
import AppUser from '../../interfaces/models/AppUser';
import { IGrantingPrivileges } from '../../interfaces/services/ACrudService';
import AServiceBase from '../../interfaces/services/AServiceBase';
import IServiceBase from '../../interfaces/services/IServiceBase';
import logger from '../../lib/logger';
import security from '../../lib/security.util';
import SystemConfigModel from '../../models/system/system-config.model';
import { DataAttribute, SystemConfig, SystemConfigDocument, SYSTEM_CONFIG_ID } from '../../models/system/system-config.types';

class SystemConfigService extends AServiceBase implements IServiceBase {
  protected grantingPrivileges: IGrantingPrivileges

  constructor() {
    super(
      'modules.system-config.SystemConfigService',
    );
    this.grantingPrivileges = {
      createPrivileges: [Privilege.SYSTEM_ADMIN_EDIT],
      readPrivileges: [Privilege.SYSTEM_ADMIN_EDIT],
      updatePrivileges: [Privilege.SYSTEM_ADMIN_EDIT],
      deletePrivileges: [Privilege.SYSTEM_ADMIN_EDIT]
    }
  }


  protected isRoleBasedAccessAllowed(appUser: AppUser, grantingPrivileges: Array<Privilege>): void {
    const isAllowed = security.isRoleBasedAccessAllowed(appUser, grantingPrivileges);
    if (!isAllowed) {
      logger.info(`${this.loggerString}:isRoleBasedAccessAllowed::User has no access`, { appUser, grantingPrivileges })
      throw new HttpUnauthorizedException('Your role does not allow access to this resource.');
    }
  }

  /**
   * Can only be used if no system object is there yet.
   * @param appUser
   */
  public async createSystemConfig(appUser: AppUser): Promise<SystemConfigDocument> {
    logger.info(`${this.loggerString}:createSystemConfig::Start`);

    this.isRoleBasedAccessAllowed(appUser, this.grantingPrivileges.createPrivileges);

    const config = await SystemConfigModel.findById(SYSTEM_CONFIG_ID);
    if (config) {
      throw new HttpMethodNotAllowedException("System config object already exists");
    }

    const systemConfig: SystemConfig = {
      dataConfig: {
        customer: {
          dataAttributes: [],
          dataGroups: [],
          dataEnumTypes:[],
        }
      },
      dashboardConfig:{
        dashboardLink: '',
        dashboardName: '',
        height: ''
      }

    }

    //I am too stupid to get this to work differently...
    const systemConfigWithId = <any>systemConfig
    systemConfigWithId["_id"] = SYSTEM_CONFIG_ID

    const result = new SystemConfigModel(systemConfigWithId);
    return await result.save()
  }


  public async readSystemConfig(appUser: AppUser): Promise<SystemConfigDocument> {
    logger.debug(`${this.loggerString}:readOneById::Start`);

    this.isRoleBasedAccessAllowed(appUser, this.grantingPrivileges.readPrivileges);

    const result = await SystemConfigModel.findById(SYSTEM_CONFIG_ID)

    if (!result) {
      throw new HttpObjectNotFoundException("Object does not exist.");
    }

    return result;
  }

  /**
   * For internal processing
   */
  public async readSystemConfigLean(): Promise<SystemConfig | null> {
    const systemConfig = await SystemConfigModel.findById(SYSTEM_CONFIG_ID).lean()
    return <SystemConfig>systemConfig;
  }


  /**
   * Reads customer data attribute config and converts this into a map with Map<dataAttribute.code, DataAttribute>
   * dataAttribute.code is the attribute name on the customer object (e.g. fistName or birthdate)
   */
  public async readCustomerDataAttributeConfigFromSystemConfigAsMap(): Promise<Map<string, DataAttribute>> {
    const systemConfig = await this.readSystemConfigLean()
    const dataAttributes = systemConfig?.dataConfig?.customer?.dataAttributes
    if (!dataAttributes) {
      const errorMsg = `No dataAttributes defined in system config`
      logger.error(`${this.loggerString}:readCustomerDataAttributeConfigFromSystemConfigAsMap::${errorMsg}`)
      throw new AppException(errorMsg);
    }

    const objMap = new Map<string, any>()
    for (let obj of dataAttributes) {
      objMap.set(obj.code, obj);
    }

    return objMap;
  }

  /**
   * This method is specifically for the login route. It uses white-listing to select the appropriate system-config fields.
   */
  public async readSystemConfigForLogin(): Promise<SystemConfig | null> {
    const systemConfig = await SystemConfigModel.findById(SYSTEM_CONFIG_ID)
      .select('-_id dataConfig')
      .lean()
    //allowed to return null if not present
    return <SystemConfig>systemConfig;
  }

  /**
   * This method is specifically for the login route. It uses white-listing to select the appropriate system-config-DasboardLink fields.
   */
   public async readSystemConfigDashboardConfigForLogin(): Promise<SystemConfig | null> {
    const systemConfig = await SystemConfigModel.findById(SYSTEM_CONFIG_ID)
      .select('-_id dashboardConfig')
      .lean()
    //allowed to return null if not present
    return <SystemConfig>systemConfig;
  }

  public async updateDataConfigCustomerDataGroups(appUser: AppUser, payload: any): Promise<any> {
    logger.debug(`${this.loggerString}:updateDataConfigCustomerDataGroups::Started`);

    const systemConfig = await this.readSystemConfig(appUser);
    systemConfig.dataConfig.customer.dataGroups = payload
    const result = await systemConfig.save()
    return result.dataConfig.customer.dataGroups;
  }

  public async updateDataConfigCustomerDataAttributes(appUser: AppUser, payload: any): Promise<any> {
    logger.debug(`${this.loggerString}:updateDataConfigCustomerDataAttributes::Started`);

    const systemConfig = await this.readSystemConfig(appUser);
    systemConfig.dataConfig.customer.dataAttributes = payload
    const result = await systemConfig.save()
    return result.dataConfig.customer.dataAttributes;
  }
  public async updateCustomerConfigEnumTypes(appUser: AppUser, payload: any): Promise<any> {
    logger.debug(`${this.loggerString}:updateDataConfigCustomerDataAttributes::Started`);

    const systemConfig = await this.readSystemConfig(appUser);
    systemConfig.dataConfig.customer.dataEnumTypes = payload
    const result = await systemConfig.save()
    return result.dataConfig.customer.dataEnumTypes;
  }


  /**
   * This does not work yet!
   * @param appUser
   * @param path
   * @param id
   * @param payload
   */
  public async updateOneSubDocById(appUser: AppUser, path: string, id: string, payload: any): Promise<any> {
    logger.debug(`${this.loggerString}:updateOneSubDocById::Started`);
    this.isRoleBasedAccessAllowed(appUser, this.grantingPrivileges.updatePrivileges);
    const result = await SystemConfigModel.findOneAndUpdate({ _id: SYSTEM_CONFIG_ID, 'dataConfig.customer.dataGroups._id': id }, {
      $set: {
        "dataConfig.customer.dataGroups.$.name": payload.name,
        "dataConfig.customer.dataGroups.$.detailViewOrder": payload.detailViewOrder,
        "dataConfig.customer.dataGroups.$.code": payload.code,
      }
    })
    if (!result) {
      if (!result) {
        throw new HttpObjectNotFoundException("Object does not exist.");
      }
    }
    return result.dataConfig.customer.dataGroups;
  }
  public async updateDataAttributeDocById(appUser: AppUser, id: string, payload: any): Promise<any> {
    logger.debug(`${this.loggerString}:updateDataAttributeDocById::Started`);
    this.isRoleBasedAccessAllowed(appUser, this.grantingPrivileges.updatePrivileges);
    const result = await SystemConfigModel.findOneAndUpdate({ _id: SYSTEM_CONFIG_ID, 'dataConfig.customer.dataAttributes._id': id }, {
      $set: {
        "dataConfig.customer.dataAttributes.$.name": payload.name,
        "dataConfig.customer.dataAttributes.$.detailViewOrder": payload.detailViewOrder,
        "dataConfig.customer.dataAttributes.$.code": payload.code,
        "dataConfig.customer.dataAttributes.$.groupCode": payload.groupCode,
        "dataConfig.customer.dataAttributes.$.shortName": payload.shortName,
        "dataConfig.customer.dataAttributes.$.type": payload.type,
        "dataConfig.customer.dataAttributes.$.data": payload.data,
      }
    }, { new: true })
    if (!result) {

      throw new HttpObjectNotFoundException("Object does not exist.");
    }
    return result.dataConfig.customer.dataAttributes;
  }
  public async removeDataGroupById(appUser: AppUser, id: string, code: string): Promise<any> {
    logger.debug(`${this.loggerString}:removeDataGroupById::Started`);
    this.isRoleBasedAccessAllowed(appUser, this.grantingPrivileges.deletePrivileges);
    // make sure the group is not used on data attribute
    const result = await SystemConfigModel.findOneAndUpdate({ $and: [{ _id: SYSTEM_CONFIG_ID }, { 'dataConfig.customer.dataGroups._id': id }, { "dataConfig.customer.dataAttributes.groupCode": { $ne: code } }] }, {
      $pull: {
        'dataConfig.customer.dataGroups._id': id 
      }
    });
    if (!result) {
      throw new HttpObjectNotFoundException("Can not delete dataGroup");
    }
    return result.dataConfig.customer.dataGroups;
  }
  public async removeDataAttributeById(appUser: AppUser, id: string): Promise<any> {
    logger.debug(`${this.loggerString}:removeDataAttributeById::Started`);
    this.isRoleBasedAccessAllowed(appUser, this.grantingPrivileges.deletePrivileges);
    const result = await SystemConfigModel.findOneAndUpdate({ _id: SYSTEM_CONFIG_ID}, {
      $pull:{
        'dataConfig.customer.dataAttributes._id': id 
      }
    });
    if (!result) {
      throw new HttpObjectNotFoundException("Attribute not found ");
    }
    return result.dataConfig.customer.dataAttributes;
  }
  public async updateDashboardConfig(appUser: AppUser, payload: any){
    logger.debug(`${this.loggerString}:updateDashboardConfig::Started`);
    this.isRoleBasedAccessAllowed(appUser, this.grantingPrivileges.deletePrivileges);
    const result = await SystemConfigModel.findOneAndUpdate({ _id: SYSTEM_CONFIG_ID}, { dashboardConfig: payload}, {new:true});
    if (!result) {
      throw new HttpObjectNotFoundException("No config found ");
    }
    return result.dashboardConfig;
  }
  
}

export default SystemConfigService
