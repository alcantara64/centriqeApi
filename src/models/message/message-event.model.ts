import mongoose from 'mongoose';
import DataDomain from '../../enums/DataDomain';
import { emailSchema, intSchema, stringEnumSchema } from '../../lib/mongoose.util';
import { MessageChannel } from '../message/message.types';
import { MessageEventDocument, MessageEventStatus, MessageEventType } from './message-event.types';


const MessageEventSchema = new mongoose.Schema(
  {
    holdingOrg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HoldingOrg',
    },
    memberOrg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MemberOrg',
    },
    date: {
      type: Date,
      required: true,
    },
    status: stringEnumSchema(MessageEventStatus, { required: true, defaultValue: MessageEventStatus.PENDING }),
    processStartDt: {
      type: Date
    },
    processEndDt: {
      type: Date
    },
    statusMessage: {
      type: String
    },

    summary: {
      generated: intSchema({ defaultValue: 0 }),
      accepted: intSchema({ defaultValue: 0 }),
      delivered: intSchema({ defaultValue: 0 }),
      unsubscribed: intSchema({defaultValue: 0}),
      opened: intSchema({ defaultValue: 0 }),
      rejected: intSchema({ defaultValue: 0 }),
      failed: intSchema({ defaultValue: 0 }),
      softFailed: intSchema({ defaultValue: 0 }),
      complained: intSchema({ defaultValue: 0 })
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    discriminatorKey: 'eventType'
  }
);


const MessageEventModel = mongoose.model<MessageEventDocument>('MessageEvent', MessageEventSchema);


const TransactionalPayloadSchema = new mongoose.Schema({},
  { discriminatorKey: 'channel', _id: false }
);

const TransactionalMessageEventSchema = new mongoose.Schema(
  {
    payload: TransactionalPayloadSchema
  }
)
MessageEventModel.discriminator(MessageEventType.TRANSACTIONAL, TransactionalMessageEventSchema);


const docTransactionalPayload: any = TransactionalMessageEventSchema.path('payload');
const TransactionalEmailMessageSchema = new mongoose.Schema(
  {
    from: emailSchema({ required: false, emailValidation: { allowDisplayName: true } }),
    to: emailSchema({ required: true }),
    cc: emailSchema(),
    bcc: emailSchema(),

    subject: { type: String, required: true },
    body: { type: String, required: true },

    tags: { type: [String] },

  },
  { _id: false }
);
docTransactionalPayload.discriminator(MessageChannel.EMAIL, TransactionalEmailMessageSchema);


const TransactionalSmsMessageSchema = new mongoose.Schema(
  {
    from: { type: String },
    to: { type: String, required: true },
    text: { type: String, required: true },
    tags: { type: [String] },
    //what about image?
  },
  { _id: false }
);
docTransactionalPayload.discriminator(MessageChannel.SMS, TransactionalSmsMessageSchema);

const TransactionalWhatsAppMessageSchema = new mongoose.Schema(
  {
    from: { type: String },
    to: { type: String, required: true },
    text: { type: String, required: true }
    //what about image?
  },
  { _id: false }
);
docTransactionalPayload.discriminator(MessageChannel.WHATSAPP, TransactionalWhatsAppMessageSchema);



const TemplateScheduledMessageEventSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true
    },
    campaignVersion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CampaignVersion',
      required: true
    },
    campaignCode: {
      type: String,
      required: true
    },
    dataDomain: stringEnumSchema(DataDomain),
  }
)
MessageEventModel.discriminator(MessageEventType.CAMPAIGN, TemplateScheduledMessageEventSchema);




const TemplateInteractiveMessageEventSchema = new mongoose.Schema(
  {
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MessageTemplate',
      required: true
    },
    dataDomain: stringEnumSchema(DataDomain),
    channel: stringEnumSchema(MessageChannel),
    customers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    }],
    manualOverride: {
      emailTo: String,
      whatsAppTo: String,
      smsTo: String
    }
  }
);
MessageEventModel.discriminator(MessageEventType.INTERACTIVE_TEMPLATE, TemplateInteractiveMessageEventSchema);


const SurveyInteractiveMessageEventSchema = new mongoose.Schema(
  {
    survey: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Survey',
      required: true
    },
    surveyVersion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SurveyVersion',
      required: true
    },
    surveyCode: {
      type: String,
      required: true
    },
    dataDomain: stringEnumSchema(DataDomain),
    channel: stringEnumSchema(MessageChannel),
    customers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    }],
    manualOverride: {
      emailTo: String,
      whatsAppTo: String,
      smsTo: String
    }
  }
);
MessageEventModel.discriminator(MessageEventType.INTERACTIVE_SURVEY, SurveyInteractiveMessageEventSchema);



export default MessageEventModel;
