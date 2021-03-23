import AppUser from '../../interfaces/models/AppUser';
import DataDomain from '../../enums/DataDomain';
import Privilege from '../../enums/Privilege';
import ACrudService from '../../interfaces/services/ACrudService';
import ICrudService, { SearchQueryOps } from '../../interfaces/services/ICrudService';
import IServiceBase from '../../interfaces/services/IServiceBase';
import MessageModel from '../../models/message/message.model';





class MessageService extends ACrudService implements IServiceBase, ICrudService {

  constructor() {
    super(
      MessageModel,
      'modules.message-event.MessageEventService',
      {
        createPrivileges: [Privilege.SYSTEM_ADMIN_EDIT],
        readPrivileges: [
          Privilege.SYSTEM_ADMIN_EDIT,
          Privilege.COMM_AI_VIEW,
          Privilege.COMM_AI_EDIT,
          Privilege.RESP_AI_VIEW,
          Privilege.RESP_AI_EDIT,
          Privilege.NPS_VIEW,
          Privilege.NPS_EDIT
        ],
        updatePrivileges: [],
        deletePrivileges: []
      },
      DataDomain.NONE
    );

  }

  protected isRowLevelSecurityEnabled(methodName: string): boolean {
    return false;
  }

  protected getSortOrderForReadMany() {
    return { createdAt: -1, _id: -1 }
  }

  protected getMongooseQueryPopulateOptions(methodName: "readOneById" | "readMany"): string | null | Array<Object> {
    let opts = null;

    if (methodName === "readOneById") {
      opts = [
        /** All */
        { path: 'messageEvent' },

        /** Template interactive */
        { path: 'provider.messageTemplate provider.customer provider.holdingOrg provider.memberOrg' },

        /** Template scheduled */
        //needs to be reviewed
        { path: 'provider.campaign provider.messageTemplate provider.customer.holdingOrg provider.customer.memberOrg provider.holdingOrg provider.memberOrg' },
      ];
    }

    return opts;
  }


  public async readManyMessageEventsByMessageEventId(appUser: AppUser, messageEventId: string, queryOpts: any = {}): Promise<any> {
    //TODO: review security. currently anyone with the eventId can get all messages
    queryOpts.messageEvent = messageEventId
    queryOpts.disableWildcardFor = { messageEvent: 1 }
    return await this.readMany(appUser, queryOpts)
  }
  public async searchMessageEventsByMessageEventIdAndDataDomain(appUser: AppUser,campaignId:string, messageEventId: string, queryOpts: SearchQueryOps, dataDomain: DataDomain): Promise<any> {
    this.dataDomain = dataDomain;
    
    const additionalQuery: any = {
      'provider.eventType': 'campaign',
      'messageEvent': messageEventId
    }
    /**2021-02-24 Ritesh - included to eliminate the mandatory campaignId */
    if (campaignId !== undefined) {
      additionalQuery["provider.campaign"] = campaignId
    }

    if (dataDomain !== DataDomain.NONE) {
      additionalQuery["provider.dataDomain"] = dataDomain
    }

    queryOpts.query = {
      $and: [
        additionalQuery,
        queryOpts.query
      ]
    }
    return await this.searchByQuery(appUser, queryOpts)
  }

  public async searchMessageEventsByMessageEventId(appUser: AppUser, messageEventId: string, queryOpts: SearchQueryOps): Promise<any> {
    queryOpts.query = {
      $and: [
        { messageEvent: messageEventId },
        queryOpts.query
      ]
    }
    return await this.searchByQuery(appUser, queryOpts)
  }

}

export default MessageService
