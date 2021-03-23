import { Document, Model } from "mongoose";
import DataDomain from "../../enums/DataDomain";
import { MessageChannel } from "../message/message.types";


export enum MessageEventStatus {
  PROCESSED = "processed",
  FAILED = "failed",
  PENDING = "pending",
  PENDING_IGNORE_EXPIRY = 'pending-ignore-expiry',
  PROCESSING = "processing",
  EXPIRED = "expired"
}

export enum MessageEventType {
  TRANSACTIONAL = "transactional",
  CAMPAIGN = "campaign",
  INTERACTIVE_TEMPLATE = "interactiveTemplate",
  INTERACTIVE_SURVEY = "interactiveSurvey"
}

export enum MessageEventSummaryType {
  GENERATED = "generated",
  ACCEPTED = "accepted",
  DELIVERED = "delivered",
  UNSUBSCRIBED = "unsubscribed",
  OPENED = "opened",
  REJECTED = "rejected",
  FAILED = "failed",
  SOFT_FAILED = "softFailed",
  COMPLAINED = "complained"
}

export type MessageEventTypes = TransactionalMessageEvent | TemplateScheduledMessageEvent | TemplateInteractiveMessageEvent

export interface MessageEvent {
  date: Date;
  eventType: MessageEventType;
  status?: MessageEventStatus;
  statusMessage?: string;
  processStartDt?: Date;
  processEndDt?: Date;
  createdBy?: string;
  modifiedBy?: string;

  summary?: {
    generated: number;
    accepted: number;
    delivered: number;
    unsubscribed: number;
    opened: number;
    rejected: number;
    failed: number;
    softFailed: number;
    complained: number;
  }
}

export interface MessageEventDocument extends MessageEvent, Document { }
export interface MessageEventModel extends Model<MessageEventDocument> { }


export interface TransactionalMessageEvent extends MessageEvent {
  readonly eventType: MessageEventType.TRANSACTIONAL;
  payload: TransactionalPayload;
}

export interface TransactionalMessageEventDocument extends TransactionalMessageEvent, Document { }
export interface TransactionalMessageEventModel extends Model<TransactionalMessageEventDocument> { }


export type TransactionalPayload = TransactionalEmailPayload | TransactionalSmsPayload | TransactionalWhatsAppPayload;

export interface TransactionalEmailPayload {
  readonly channel: MessageChannel.EMAIL,
  from?: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  tags: Array<string>;
}

export interface TransactionalSmsPayload {
  readonly channel: MessageChannel.SMS,
  from?: string;
  to: string;
  text: string;
  tags: Array<string>;
}

export interface TransactionalWhatsAppPayload {
  readonly channel: MessageChannel.WHATSAPP,
  from?: string;
  to: string;
  text: string;
  tags: Array<string>;
}


export interface TemplateScheduledMessageEvent extends MessageEvent {
  readonly eventType: MessageEventType.CAMPAIGN;
  campaign: string;
  campaignCode: string;
  campaignVersion: string;
  dataDomain: DataDomain;
  holdingOrg?: string;
  memberOrg?: string;
}
export interface TemplateScheduledMessageEventDocument extends TemplateScheduledMessageEvent, Document { }
export interface TemplateScheduledMessageEventModel extends Model<TemplateScheduledMessageEventDocument> { }


export interface InteractiveMessageEvent extends MessageEvent {
  readonly eventType: MessageEventType;

  channel?: MessageChannel;
  dataDomain: DataDomain;
  customers: Array<string>,
  manualOverride?: {
    emailTo?: string,
    whatsAppTo?: string,
    smsTo?: string
  }
}
export interface InteractiveMessageEventDocument extends InteractiveMessageEvent, Document { }


export interface TemplateInteractiveMessageEvent extends InteractiveMessageEvent {
  readonly eventType: MessageEventType.INTERACTIVE_TEMPLATE;
  template: string;
}
export interface TemplateInteractiveMessageEventDocument extends TemplateInteractiveMessageEvent, Document { }


export interface SurveyInteractiveMessageEvent extends InteractiveMessageEvent {
  readonly eventType: MessageEventType.INTERACTIVE_SURVEY;
  survey: string;
  surveyVersion: string;
  surveyCode: string;
}
export interface SurveyInteractiveMessageEventDocument extends SurveyInteractiveMessageEvent, Document { }
export interface SurveyInteractiveMessageEventModel extends Model<SurveyInteractiveMessageEventDocument> { }

export type TemplateMessageEventDocument = InteractiveMessageEventDocument | TemplateScheduledMessageEventDocument | TemplateInteractiveMessageEventDocument | SurveyInteractiveMessageEventDocument
