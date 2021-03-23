import AppUser from '../../interfaces/models/AppUser';
import { DataAttribute, DataAttributeType } from '../../models/system/system-config.types';
import DataDomain from '../../enums/DataDomain';
import Privilege from '../../enums/Privilege';
import ACrudService from '../../interfaces/services/ACrudService';
import ICrudService from '../../interfaces/services/ICrudService';
import IServiceBase from '../../interfaces/services/IServiceBase';
import CustomerModel from '../../models/org/customer.model';
import { HoldingOrgDataAttributeConfig } from '../../models/org/holding-org.types';
import HoldingOrgService from '../holding-org/HoldingOrgService';
import SystemConfigService from '../system-config/SystemConfigService';
import logger from '../../lib/logger';
import AppException from '../../exceptions/AppException';
import { DateTime } from 'luxon'
import { generateCustomerFilterQuery } from '../../models/campaign/campaign.model';
import ModelStatus from '../../enums/ModelStatus';
import { QueryLimiter } from '../../lib/security.util';
import { Criteria } from '../../lib/search.util';


class CustomerService extends ACrudService implements IServiceBase, ICrudService {
  private holdingOrgService: HoldingOrgService
  private systemConfigService: SystemConfigService

  constructor() {
    super(
      CustomerModel,
      'modules.customer.CustomerService',
      {
        createPrivileges: [Privilege.CLIENT_SETUP_EDIT],
        readPrivileges: [
          Privilege.CLIENT_SETUP_VIEW, Privilege.CLIENT_SETUP_EDIT,
          Privilege.COMM_AI_VIEW, Privilege.COMM_AI_EDIT,
          Privilege.RESP_AI_VIEW, Privilege.RESP_AI_EDIT,
          Privilege.NPS_VIEW, Privilege.NPS_EDIT
        ],
        updatePrivileges: [Privilege.CLIENT_SETUP_EDIT],
        deletePrivileges: [Privilege.CLIENT_SETUP_EDIT]
      },
      DataDomain.CUSTOMER
    );
    this.holdingOrgService = new HoldingOrgService()
    this.systemConfigService = new SystemConfigService()
  }

  /**
   * Remove once UI is updated
   * @deprecated
   */
  protected getFieldNamesForSearch() {
    return ['memberOrg', 'holdingOrg', 'status'];
  }


  async getHoldingOrgAttributeConfig(appUser: AppUser, holdingOrgId: string): Promise<HoldingOrgDataAttributeConfig[]> {
    const dataAttributes = await this.holdingOrgService.getAttributeConfig(holdingOrgId, "customer")
    return dataAttributes;
  }

  protected convertCriteriaToMongooseQueryAndAttachOrgLimiter(criteria: Criteria, orgLimiter: QueryLimiter, modelStatus?: ModelStatus[]): any {
    //making sure the campaign query check uses the same query as the filter on the saved campaign
    //only difference is the security -- AcrudService will check for user's security. The campaign query will not.
    return generateCustomerFilterQuery(criteria, orgLimiter);
  }

  /**
   * This is necessary because we have a flexible data attribute schema for customers that is driven by configuration.
   * We need to enforce data types manually
   * @param payload
   * @param dataAttributes
   */
  protected checkAndUpdateCustomerPayload(payload: any[], dataAttributeMap: Map<string, DataAttribute>) {
    logger.debug(`${this.loggerString}:checkAndUpdateCustomerPayload::Start`);

    for (let customer of payload) {

      Object.keys(customer).forEach(key => {
        const dataAttribute = dataAttributeMap.get(key);
        if (!dataAttribute
          && key !== 'modifiedBy'
          && key !== 'createdBy') {
          const errorMsg = `Data attribute does not exist in configuration ${key}`
          logger.error(`${this.loggerString}:checkAndUpdateCustomerPayload::${errorMsg}`)
          throw new AppException(errorMsg);
        }

        if (dataAttribute) {
          switch (dataAttribute.type) {
            case DataAttributeType.DATE_TIME:
            case DataAttributeType.DATE: {
              customer[key] = DateTime.fromISO(customer[key]).setZone('UTC').toJSDate();
              break;
            }

            case DataAttributeType.INTEGER:
            case DataAttributeType.NUMBER: {
              customer[key] = Number(customer[key])
              break;
            }

          }
        }

      })

    }

  }


  protected async beforeCreateOne(appUser: AppUser, payload: any): Promise<void> {
    const dataAttributeMap = await this.systemConfigService.readCustomerDataAttributeConfigFromSystemConfigAsMap();
    this.checkAndUpdateCustomerPayload([payload], dataAttributeMap)
  }

  protected async beforeCreateMany(appUser: AppUser, payload: Array<any>): Promise<void> {
    const dataAttributeMap = await this.systemConfigService.readCustomerDataAttributeConfigFromSystemConfigAsMap();
    this.checkAndUpdateCustomerPayload(payload, dataAttributeMap)
  }

}

export default CustomerService
