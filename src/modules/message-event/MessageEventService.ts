import HttpBadRequestException from '../../exceptions/http/HttpBadRequestException';
import DataDomain from '../../enums/DataDomain';
import Privilege from '../../enums/Privilege';
import HttpObjectNotFoundException from '../../exceptions/http/HttpObjectNotFoundException';
import HttpUnauthorizedException from '../../exceptions/http/HttpUnauthorizedException';
import AppUser from '../../interfaces/models/AppUser';
import ACrudService from '../../interfaces/services/ACrudService';
import ICrudService from '../../interfaces/services/ICrudService';
import IServiceBase from '../../interfaces/services/IServiceBase';
import config from '../../lib/config';
import logger from '../../lib/logger';
import CampaignModel from '../../models/campaign/campaign.model';
import MessageEventModel from '../../models/message/message-event.model';
import { MessageEvent, MessageEventType, SurveyInteractiveMessageEvent, TemplateInteractiveMessageEvent, TransactionalMessageEvent, TransactionalPayload } from '../../models/message/message-event.types';
import { MessageChannel } from '../../models/message/message.types';
import CustomerService from '../customer/CustomerService';
import MessageTemplateService from '../message-template/MessageTemplateService';
import NpsSurveyService from '../survey/NpsSurveyService';
import RespSurveyService from '../survey/RespSurveyService';
import IRoleBasedUserSecurity from '../../interfaces/models/IRoleBasedUserSecurity';
import { SurveyDocument } from '../../models/resp/survey.types';
import ASurveyService from '../survey/ASurveyService';


export type TransactionalEventDataEmail = {
  channel: MessageChannel.EMAIL,
  from?: string,
  to: string,
  subject: string,
  body: string
}

export type TransactionalSystemEventDataEmail = {
  to: string,
  subject: string,
  body: string
}

export type TransactionalEventDataSms = {
  channel: MessageChannel.SMS,
  from?: string,
  to: string,
  text: string
}

export type TransactionalEventDataWhatsApp = {
  channel: MessageChannel.WHATSAPP,
  from?: string,
  to: string,
  text: string
}


export type TransactionalEventData = TransactionalEventDataEmail | TransactionalEventDataWhatsApp | TransactionalEventDataSms

export type ChannelSelection = {
  email?: boolean,
  sms?: boolean,
  whatsApp?: boolean,
  basedOnCustomer?: boolean
}

export type TemplateInteractiveEventData = {
  templateId: string,
  surveyId: string,
  customerIds: Array<string>,
  channelSelection: ChannelSelection
  manualOverride?: {
    emailTo: string
    whatsAppTo: string,
    smsTo: string
  },
  dataDomain?: DataDomain
}


class MessageEventService extends ACrudService implements IServiceBase, ICrudService {
  private customerService: CustomerService;
  private messageTemplateService: MessageTemplateService;
  private npsSurveyService: NpsSurveyService;
  private respSurveyService: RespSurveyService;

  constructor() {
    super(
      MessageEventModel,
      'modules.message-event.MessageEventService',
      {
        createPrivileges: [Privilege.SYSTEM_ADMIN_EDIT],
        readPrivileges: [Privilege.SYSTEM_ADMIN_EDIT, Privilege.SYSTEM_ADMIN_EDIT],
        updatePrivileges: [Privilege.SYSTEM_ADMIN_EDIT],
        deletePrivileges: [Privilege.SYSTEM_ADMIN_EDIT]
      },
      DataDomain.NONE
    );

    this.customerService = new CustomerService();
    this.messageTemplateService = new MessageTemplateService();
    this.npsSurveyService = new NpsSurveyService();
    this.respSurveyService = new RespSurveyService();
  }

  protected isRowLevelSecurityEnabled(methodName: string): boolean {
    return false;
  }

  protected isRoleBasedAccessAllowed(roleSecurity: IRoleBasedUserSecurity, grantingPrivileges: Array<Privilege>): void {
    //QUICK HACK: disabled role based access
    //TODO: revamp role based access control
  }

  protected getSortOrderForReadMany() {
    return { date: -1, _id: -1 }
  }


  protected getMongooseQueryPopulateOptions(methodName: "readOneById" | "readMany"): string | null | Array<Object> {
    let opts = null;

    if (methodName === "readOneById") {
      opts = [
        /** All */
        { path: 'holdingOrg', select: "_id name code" },
        { path: 'memberOrg', select: "_id name code" },

        /** Template interactive */
        { path: 'customers' },
        { path: 'template', populate: { path: 'holdingOrg memberOrg', select: '_id name code' } },

        /** Template interactive */
        { path: 'surveyVersion', populate: { path: 'holdingOrg memberOrg', select: '_id name code' } },

        /** Template scheduled */
        { path: 'campaign' }
      ];
    }

    return opts;
  }


  /**
   * Creates template interactive events. Mainly used in frontend service. No role or row security other than on the templates and customers.
   * @param appUser
   * @param templateId
   * @param customerIds
   * @param channelSelection If basedOnCustomer is set, other channel selection are ignored.
   */
  public async createManyInteractiveEvents(appUser: AppUser, data: TemplateInteractiveEventData) {
    logger.debug(`${this.loggerString}:createManyInteractiveEvents::Start`, { appUser: appUser, data: data });
    const { customerIds, channelSelection } = data;

    const customersResultObj = await this.customerService.readMany(appUser, { _id: customerIds });
    const customers = customersResultObj.results;
    let dataDomain = data.dataDomain
    if (!dataDomain) {
      //for legacy ui implementation, can be removed once UI is adjusted
      dataDomain = DataDomain.COMM;
    }

    let channels: Array<MessageChannel> = [];

    //only add channels if basedOnCustomer is false
    if (!channelSelection.basedOnCustomer) {
      if (channelSelection.email) {
        channels.push(MessageChannel.EMAIL);
      }
      if (channelSelection.sms) {
        channels.push(MessageChannel.SMS);
      }
      if (channelSelection.whatsApp) {
        channels.push(MessageChannel.WHATSAPP)
      }
    }

    const messageEvents: Array<TemplateInteractiveMessageEvent> = [];
    let generateEventFn: Function
    let service: ACrudService
    switch (dataDomain) {
      case DataDomain.COMM: {
        generateEventFn = this.generateTemplateInteractiveEvent
        service = this.messageTemplateService
        break;
      }

      case DataDomain.NPS: {
        generateEventFn = this.generateSurveyInteractiveEvent
        service = this.npsSurveyService
        break;
      }
      case DataDomain.RESP: {
        generateEventFn = this.generateSurveyInteractiveEvent
        service = this.respSurveyService
        break;
      }

      default: {
        throw new HttpBadRequestException("Data domain not supported - " + dataDomain);
      }

    }


    for (let customer of customers) {
      if (channelSelection.basedOnCustomer) {
        //clear channels array with just one item
        channels = [customer.prefMsgChannel];
      }

      for (let channel of channels) {
        const event = await generateEventFn(service, appUser, channel, dataDomain, data)
        messageEvents.push(event);
      }
    }

    return await this.createMany(appUser, messageEvents);
  }

  private async generateTemplateInteractiveEvent(service: ACrudService, appUser: AppUser, channel: MessageChannel, dataDomain: DataDomain, data: TemplateInteractiveEventData) {
    const { templateId, customerIds, manualOverride } = data;
    if (!templateId) {
      throw new HttpBadRequestException("templateId has to be provided")
    }

    //has user access to template?
    await service.readOneById(appUser, templateId);

    const event = {
      date: new Date(),
      eventType: MessageEventType.INTERACTIVE_TEMPLATE,
      channel: channel,
      template: templateId,
      customers: customerIds,
      manualOverride: {
        emailTo: manualOverride?.emailTo,
        smsTo: manualOverride?.smsTo,
        whatsAppTo: manualOverride?.whatsAppTo
      },
      dataDomain
    };

    return event;
  }


  private async generateSurveyInteractiveEvent(service: ASurveyService, appUser: AppUser, channel: MessageChannel, dataDomain: DataDomain, data: TemplateInteractiveEventData) {
    const { surveyId, customerIds, manualOverride } = data;
    if (!surveyId) {
      throw new HttpBadRequestException("surveyId has to be provided")
    }

    //get the survey and latest survey version
    const survey = <SurveyDocument>await service.readOneById(appUser, surveyId);
    const latestVersion = await service.getLatestVersionLean(surveyId)

    const event: SurveyInteractiveMessageEvent = {
      date: new Date(),
      eventType: MessageEventType.INTERACTIVE_SURVEY,
      channel: channel,
      survey: surveyId,
      surveyCode: survey.code,
      surveyVersion: latestVersion._id,
      customers: customerIds,
      manualOverride: {
        emailTo: manualOverride?.emailTo,
        smsTo: manualOverride?.smsTo,
        whatsAppTo: manualOverride?.whatsAppTo
      },
      dataDomain,

    };

    return event;
  }


  /**
   * Secured to only admins at this point. THis is not exposed to the UI anymore.
   * @param appUser
   * @param data
   */
  public async createOneTransactionalEvent(appUser: AppUser, data: TransactionalEventData) {
    logger.debug(`${this.loggerString}:createOneTransactionalEvent::Start`, { appUser: appUser, data: data });

    if (!appUser.isAdmin) {
      throw new HttpUnauthorizedException("You are not allowed to use this feature.");
    }

    data.from = (<any>config.messaging)[data.channel].defaultSender

    const messageEvent: TransactionalMessageEvent = {
      date: new Date(),
      eventType: MessageEventType.TRANSACTIONAL,
      payload: <TransactionalPayload>data
    };

    return await this.createOne(appUser, messageEvent);
  }


  /**
   * Used for system events like password reset.
   * @param data
   */
  public async createOneSystemTransactionalEvent(data: TransactionalSystemEventDataEmail) {
    logger.debug(`${this.loggerString}:createOneSystemTransactionalEvent::Start`, { data: data });


    const messageEvent: TransactionalMessageEvent = {
      date: new Date(),
      eventType: MessageEventType.TRANSACTIONAL,
      payload: {
        //no from, this will be picked up by the defaults in messaging-service
        body: data.body,
        channel: MessageChannel.EMAIL,
        subject: data.subject,
        to: data.to,
        tags: []
      }
    };

    return await this.createOneNoSecurity(messageEvent);
  }



  private async createOneNoSecurity(messageEvent: MessageEvent): Promise<any> {
    logger.debug(`${this.loggerString}:createOneNoSecurity::Start`);

    const newModel = new MessageEventModel(messageEvent);
    return await newModel.save();
  }



  public async readManyMessageEventsByCampaignParentId(appUser: AppUser, campaignId: string, queryOpts: any = {}): Promise<any> {

    //TODO: add access check. we'll need the data domain along with the cammpaign ID for that or just introduce a different check mechanism
    //ideally implement generic campaignservice
    const campaign = await CampaignModel.findById(campaignId);
    if (!campaign) {
      throw new HttpObjectNotFoundException("Campaign not found")
    }

    queryOpts.campaign = campaign._id
    queryOpts.disableWildcardFor = { campaign: 1 }
    return await this.readMany(appUser, queryOpts)
  }

  public async searchEventByDataDomain(appUser: AppUser, campaignId: string, queryOpts: any, dataDomain: DataDomain): Promise<any> {

    const additionalQuery: any = {
      eventType: 'campaign'
    }

    if (campaignId !== undefined) {
      additionalQuery["campaign"] = campaignId
    }

    if (dataDomain !== DataDomain.NONE) {
      additionalQuery["dataDomain"] = dataDomain
    }

    queryOpts.query = {
      $and: [
        additionalQuery,
        queryOpts.query
      ]
    }

    const populate = [
      { path: 'campaign', select: "_id name code" },
    ]

    return await this.searchByQuery(appUser, queryOpts, { populate })
  }


}

export default MessageEventService
