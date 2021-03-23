import express, { Request, Response } from 'express';
import HttpBadRequestException from '../../exceptions/http/HttpBadRequestException';
import ACrudController from '../../interfaces/controllers/ACrudController';
import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import logger from '../../lib/logger';
import { MessageChannel } from '../../models/message/message.types';
import MessageService from '../message/MessageService';
import MessageEventService, { TemplateInteractiveEventData, TransactionalEventData } from './MessageEventService';


class MessageEventController extends ACrudController implements IControllerBase, ICrudController {
  private messageService: MessageService;

  constructor() {
    super(
      new MessageEventService(),
      'modules.message-event.MessageEventController'
    );
    this.messageService = new MessageService();
  }

  addRoutesBeforeStandardRoutes(router: express.Router): void {
    router.post('/transactional', (req: Request, res: Response) => { return this.createTransactionalEvent(req, res) });
    router.post('/templateInteractive', (req: Request, res: Response) => { return this.createTemplateInteractiveEvent(req, res) });
    router.post('/:id/messages/search', (req: Request, res: Response) => { return this.searchMessages(req, res) });
  }

  public async createTransactionalEvent(req: Request, res: Response): Promise<any> {
    logger.debug(`${this.loggerString}:createTransactionalEvent::Start`);
    const appUser = this.extractAppUser(req);
    const messageEventService = <MessageEventService>this.crudService

    const channel: MessageChannel = req.body.channel;
    let data: TransactionalEventData

    switch (channel) {
      case MessageChannel.EMAIL: {
        data = {
          channel: channel,
          from: req.body.from,
          to: req.body.to,
          subject: req.body.subject,
          body: req.body.body
        }
        break;
      }
      case MessageChannel.SMS: {
        data = {
          channel: channel,
          from: req.body.from,
          to: req.body.to,
          text: req.body.text
        }
        break;
      }
      case MessageChannel.WHATSAPP: {
        data = {
          channel: channel,
          from: req.body.from,
          to: req.body.to,
          text: req.body.text
        }
        break;
      }

      default: {
        throw new HttpBadRequestException(`Channel ${channel} not supported.`)
      }
    }

    const result = await messageEventService.createOneTransactionalEvent(appUser, data);
    return res.send(result);
  }


  public async createTemplateInteractiveEvent(req: Request, res: Response): Promise<any> {
    logger.debug(`${this.loggerString}:createTemplateInteractiveEvent::Start`);
    const appUser = this.extractAppUser(req);
    const messageEventService = <MessageEventService>this.crudService

    let data: TemplateInteractiveEventData = req.body;

    const result = await messageEventService.createManyInteractiveEvents(appUser, data);
    return res.send(result);
  }

  public async searchMessages(req: Request, res: Response): Promise<any> {
    logger.debug(`${this.loggerString}:searchMessages::Start`);
    const appUser = this.extractAppUser(req);
    const id = req.params.id;
    const messageEvents = await this.messageService.searchMessageEventsByMessageEventId(appUser, id, req.body);
    return res.send(messageEvents);
  }


}


export default MessageEventController
