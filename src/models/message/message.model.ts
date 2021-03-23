import mongoose from 'mongoose';
import DataDomain from '../../enums/DataDomain';
import { EmailMessageDocument, MessageChannel, MessageDocument, MessageStatus } from './message.types';
import { MessageEventType } from './message-event.types';
import { validateDataAndGenerateErrorObject } from "./message.methods";
import { stringEnumSchema } from '../../lib/mongoose.util';

const MessageProvider = new mongoose.Schema({},
  { discriminatorKey: 'eventType', _id: false });

const MessageSchema: any = new mongoose.Schema(
  {
    messageEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MessageEvent'
    },
    provider: MessageProvider,
    status: stringEnumSchema(MessageStatus, { required: true }),
    statusMessage: { type: String },
  },
  {
    timestamps: true,
    discriminatorKey: 'channel'
  }
);

MessageSchema.methods.validateDataAndGenerateErrorObject = validateDataAndGenerateErrorObject;
const MessageModel = mongoose.model<MessageDocument>('Message', MessageSchema);



/****************** message data - start ************************/

const MailgunEmailEventSchema = new mongoose.Schema(
  {
    eventId: { type: String },
    timestamp: { type: Date },
    event: { type: String },
    fullResponse: { type: Object }
  },
  {
    _id: true
  }
);
const MailgunEmailDataSchema = new mongoose.Schema(
  {
    messageId: { type: String },
    testMode: { type: Boolean, required: true },
    apiResult: { type: String },
    events: [MailgunEmailEventSchema]
  },
  {
    _id: false
  }
);
const EmailMessageSchema = new mongoose.Schema(
  {
    messageId: { type: String },
    senderDomain: { type: String },
    from: { type: String },
    to: { type: String },
    cc: { type: String },
    bcc: { type: String },
    subject: { type: String },
    body: { type: String },

    tags: { type: [String] },
    externalData: MailgunEmailDataSchema,
    reroute: {
      active: Boolean,
      originalTo: String
    }
  }
);
const MessageEmailModel = MessageModel.discriminator<EmailMessageDocument>(MessageChannel.EMAIL, EmailMessageSchema);


const TwilioSmsEventSchema = new mongoose.Schema(
  {
    eventId: { type: String },
    timestamp: { type: Date },
    event: { type: String },
  },
  {
    _id: true
  }
);
const TwilioSmsDataSchema = new mongoose.Schema(
  {
    errorCode: { type: Number },
    errorMessage: { type: String },
    events: [TwilioSmsEventSchema]
  },
  {
    _id: false
  }
);

const SmsDataSchema = new mongoose.Schema(
  {
    messageId: { type: String },
    from: { type: String },
    to: { type: String },
    text: { type: String },

    tags: { type: [String] },
    externalData: TwilioSmsDataSchema,
    reroute: {
      active: Boolean,
      originalTo: String
    }
  }
);
MessageModel.discriminator(MessageChannel.SMS, SmsDataSchema);




const TwilioWhatsAppEventSchema = new mongoose.Schema(
  {
    eventId: { type: String },
    timestamp: { type: Date },
    event: { type: String },
  },
  {
    _id: true
  }
);
const TwilioWhatsAppDataSchema = new mongoose.Schema(
  {
    errorCode: { type: Number },
    errorMessage: { type: String },
    events: [TwilioWhatsAppEventSchema]
  },
  {
    _id: false
  }
);

const WhatsAppMessageSchema = new mongoose.Schema(
  {
    messageId: { type: String },
    from: { type: String },
    to: { type: String },
    text: { type: String },

    tags: { type: [String] },
    externalData: TwilioWhatsAppDataSchema,
    reroute: {
      active: Boolean,
      originalTo: String
    }
  }
);
MessageModel.discriminator(MessageChannel.WHATSAPP, WhatsAppMessageSchema);

/****************** message data - end ************************/







/****************** message provider - start ************************/
const docProvider: any = MessageSchema.path('provider');
const TemplateScheduledProviderSchema = new mongoose.Schema(
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

    dataDomain: stringEnumSchema(DataDomain, { required: true }),

    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MessageTemplate'
    },

    holdingOrg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HoldingOrg'
    },

    memberOrg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MemberOrg'
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    customerCode: {
      type: String,
      required: true
    },
    unsubscribed: { type: Boolean }
  },
  { _id: false }
);
docProvider.discriminator(MessageEventType.CAMPAIGN, TemplateScheduledProviderSchema);



const TemplateInteractiveProviderSchema = new mongoose.Schema(
  {
    dataDomain: stringEnumSchema(DataDomain, { required: true }),

    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MessageTemplate'
    },

    manualOverride: {
      active: { type: Boolean, required: true },
      originalTo: { type: String }
    },

    holdingOrg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HoldingOrg'
    },

    memberOrg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MemberOrg'
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },

    customerCode: {
      type: String,
      required: true
    },

    unsubscribed: { type: Boolean }
  },
  { _id: false }
);
docProvider.discriminator(MessageEventType.INTERACTIVE_TEMPLATE, TemplateInteractiveProviderSchema);




const SurveyInteractiveProviderSchema = new mongoose.Schema(
  {
    dataDomain: stringEnumSchema(DataDomain, { required: true }),

    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MessageTemplate'
    },

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


    manualOverride: {
      active: { type: Boolean, required: true },
      originalTo: { type: String }
    },

    holdingOrg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HoldingOrg'
    },

    memberOrg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MemberOrg'
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },

    customerCode: {
      type: String,
      required: true
    },

    unsubscribed: { type: Boolean }
  },
  { _id: false }
);
docProvider.discriminator(MessageEventType.INTERACTIVE_SURVEY, SurveyInteractiveProviderSchema);



const TransactionalProviderSchema = new mongoose.Schema(
  {}, { _id: false }
);
docProvider.discriminator(MessageEventType.TRANSACTIONAL, TransactionalProviderSchema);
/****************** message provider - end ************************/



export default MessageModel;

//export necessary for findOneAndUpdate. If done on MessageModel, the EmailModel specific fields are not updated
export {
  MessageEmailModel
}
