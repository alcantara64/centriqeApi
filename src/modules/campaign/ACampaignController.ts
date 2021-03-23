import { Request, Response, Router } from 'express';
import { DateTime } from 'luxon';
import DataDomain from 'src/enums/DataDomain';

import HttpBadRequestException from '../../exceptions/http/HttpBadRequestException';
import ACrudController from '../../interfaces/controllers/ACrudController';
import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import AppUser from '../../interfaces/models/AppUser';
import logger from '../../lib/logger';
import { getDateTimeInTimeZone } from '../../models/campaign/campaign.methods';
import MessageEventService from '../message-event/MessageEventService';
import MessageService from '../message/MessageService';
import ACampaignService from './ACampaignService';
import CampaignVersionService from './CampaignVersionService';

abstract class ACampaignController extends ACrudController implements IControllerBase, ICrudController {
  private campaignVersionService: CampaignVersionService
  private messageEventService: MessageEventService
  private messageService: MessageService

  constructor(campaignService: ACampaignService, loggerString: string, protected dataDomain: DataDomain) {
    super(
      campaignService,
      loggerString
    );
    this.campaignVersionService = new CampaignVersionService();
    this.messageEventService = new MessageEventService();
    this.messageService = new MessageService();
  }

  addRoutesBeforeStandardRoutes(router: Router): void {
    router.post('/previewSchedule', (req: Request, res: Response) => { return this.generateDateSchedule(req, res) });

    router.get('/:id/versions', (req: Request, res: Response) => { return this.getVersions(req, res) });
    router.post('/:id/messageEvents/search', (req: Request, res: Response) => { return this.getEventsByDataDomain(req, res) });
    router.post('/messageEvents/search', (req: Request, res: Response) => { return this.getEventsByDataDomain(req, res) });
    router.get('/:id/messageEvents', (req: Request, res: Response) => { return this.getEventsByCampaignId(req, res) });
    router.get('/:id/messageEvents/:messageEventId', (req: Request, res: Response) => { return this.getEvent(req, res) });
    router.get('/:id/messageEvents/:messageEventId/messages', (req: Request, res: Response) => { return this.getEventMessagesByEventId(req, res) });
    /**Ritesh 2021-02-17 */
    router.post('/:id/messageEvents/:messageEventId/messages/search', (req: Request, res: Response) => { return this.getEventMessagesByEventIdAndDataDomain(req, res) });
    router.get('/:id/messageEvents/:messageEventId/messages/:messageId', (req: Request, res: Response) => { return this.getEventMessage(req, res) });
    /**Ritesh 2021-02-24 */
    router.post('/messageEvents/:messageEventId/messages/search', (req: Request, res: Response) => { return this.getEventMessagesByEventIdAndDataDomain(req, res) });
    router.get('/messageEvents/:messageEventId/messages/:messageId', (req: Request, res: Response) => { return this.getEventMessage(req, res) });

  }

  public async getVersions(req: Request, res: Response): Promise<any> {
    logger.debug(`${this.loggerString}:getVersions::Start`);
    const appUser = this.extractAppUser(req);
    const id = req.params.id;
    const versions = await this.campaignVersionService.readManyVersionsByParentId(appUser, id, req.query);
    return res.send(versions);
  }

  public async getEventsByCampaignId(req: Request, res: Response): Promise<any> {
    logger.debug(`${this.loggerString}:getEvents::Start`);
    const appUser = this.extractAppUser(req);
    const id = req.params.id;
    const messageEvents = await this.messageEventService.readManyMessageEventsByCampaignParentId(appUser, id, req.query);
    return res.send(messageEvents);
  }
  public async getEventsByDataDomain(req: Request, res: Response): Promise<any> {
    logger.debug(`${this.loggerString}:getEventsByDataDomain::Start`);
    const appUser = this.extractAppUser(req);
    const searchQueryOpts = req.body;
    const campaignId = req.params.id;
    const messageEvents = await this.messageEventService.searchEventByDataDomain(appUser, campaignId, searchQueryOpts, this.dataDomain);
    return res.send(messageEvents);
  }
  public async getEvent(req: Request, res: Response): Promise<any> {
    logger.debug(`${this.loggerString}:getEvents::Start`);
    const appUser = this.extractAppUser(req);
    const messageEventId = req.params.messageEventId;
    const messageEvent = await this.messageEventService.readOneById(appUser, messageEventId);
    return res.send(messageEvent);
  }

  public async getEventMessagesByEventId(req: Request, res: Response): Promise<any> {
    logger.debug(`${this.loggerString}:getEvents::Start`);
    const appUser = this.extractAppUser(req);
    const messageEventId = req.params.messageEventId;
    const messages = await this.messageService.readManyMessageEventsByMessageEventId(appUser, messageEventId, req.query)
    return res.send(messages);
  }
/**Ritesh 2021-17-02 */
public async getEventMessagesByEventIdAndDataDomain(req: Request, res: Response): Promise<any> {
  logger.debug(`${this.loggerString}:getEventMessagesByEventIdAndDataDomain::Start`);
  const appUser = this.extractAppUser(req);
  const searchQueryOpts = req.body;
  const campaignId = req.params.id;
  const messageEventId = req.params.messageEventId;
  const messages = await this.messageService.searchMessageEventsByMessageEventIdAndDataDomain(appUser, campaignId, messageEventId, searchQueryOpts, this.dataDomain);
  return res.send(messages);
}
  public async getEventMessage(req: Request, res: Response): Promise<any> {
    logger.debug(`${this.loggerString}:getEvents::Start`);
    const appUser = this.extractAppUser(req);
    const messageId = req.params.messageId;
    const message = await this.messageService.readOneById(appUser, messageId)
    return res.send(message);
  }


  public async generateDateSchedule(req: Request, res: Response): Promise<any> {
    logger.debug(`${this.loggerString}:generateDateSchedule::Start`);

    this.prepareSchedulePatternPayload(req.body);

    const campaignService = <ACampaignService>this.crudService
    const dates = await campaignService.generateDateSchedule(req.body);
    return res.send(dates);
  }

  /**
   * Sets startDate and endDate correctly including sendTime
   * @param schedulePattern
   */
  public prepareSchedulePatternPayload(schedulePattern: any): void {
    const { startDate, endDate, timeZone, sendTime } = schedulePattern;

    if (!timeZone) {
      throw new HttpBadRequestException("Internal server error: Missing time zone information (timeZone attribute).");
    }

    //assuming that time always comes in 24h format. For example "23:10"
    const newStartDate = getDateTimeInTimeZone(DateTime.fromISO(startDate).toJSDate(),
      timeZone,
      sendTime);

    logger.debug(`${this.loggerString}:prepareSchedulePatternPayload::Start Date input ${startDate} - Start Date output ${newStartDate}`)

    //generating new endDate (if there is one) including hour and minute in the correct timezone.
    const newEndDate = endDate ? getDateTimeInTimeZone(DateTime.fromISO(endDate).toJSDate(),
      timeZone,
      sendTime) : undefined

    schedulePattern.startDate = newStartDate.toISO();
    schedulePattern.endDate = newEndDate ? newEndDate.toISO() : undefined

    logger.debug(`${this.loggerString}:prepareSchedulePatternPayload::End Date input ${startDate} - End Date output ${newStartDate}`)

    logger.debug("Processed schedulePattern", schedulePattern);
  }

  //see methods on parent class
  protected processPayloadCreate(appUser: AppUser, payload: any): void {
    //this is to handle the timezone translation
    if (Array.isArray(payload)) {
      payload.forEach((v: any) => {
        if (v.schedulePattern) {
          this.prepareSchedulePatternPayload(v.schedulePattern);
        }
      });
    } else {
      if (payload.schedulePattern) {
        this.prepareSchedulePatternPayload(payload.schedulePattern);
      }
    }
  }
  protected processPayloadUpdateOne(appUser: AppUser, params: any, payload: any): void {
    this.processPayloadCreate(appUser, payload);
  }
  protected processPayloadUpdateMany(appUser: AppUser, payload: any): void {
    this.processPayloadCreate(appUser, payload);
  }
}


export default ACampaignController
