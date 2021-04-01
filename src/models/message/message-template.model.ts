import mongoose from 'mongoose';
import DataDomain from '../../enums/DataDomain';
import { codeSchema, DEFAULT_MODEL_OPTIONS, isUnique, statusSchema, stringEnumSchema } from '../../lib/mongoose.util';
import { MessageTemplateDocument } from './message-template.types';

export const WhatsAppSchema = new mongoose.Schema(
  {
    text: { type: String }
  },
  { _id: false }
);

export const SmsSchema = new mongoose.Schema(
  {
    text: { type: String }
  },
  { _id: false }
);

export const EmailSchema = new mongoose.Schema(
  {
    subject: { type: String, },
    body: { type: String, },
    templateData: { type: String, }
  },
  { _id: false }
);


const MessageTemplateSchema = new mongoose.Schema<MessageTemplateDocument>(
  {
    code: codeSchemaInternal(),
    name: {
      type: String,
    },
    holdingOrg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HoldingOrg',
      default: null
    },
    memberOrg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MemberOrg',
      default: null
    },
    description: {
      type: String,
    },
    dataDomain: stringEnumSchema(DataDomain, {required: true}),
    channel: {
      email: { type: EmailSchema },
      whatsApp: { type: WhatsAppSchema },
      sms: { type: SmsSchema }
    },
    isEmailEnabled: Boolean,
    isWhatsAppEnabled: Boolean,
    isSMSEnabled: Boolean,
    status: statusSchema(),
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  DEFAULT_MODEL_OPTIONS
);



function codeSchemaInternal(): any {
  return codeSchema({
    isUniqueFn: isUniqueCode
  });
}

async function isUniqueCode(doc: any, code: any): Promise<boolean> {
  return await isUnique(MessageTemplateModel, doc, {
    code: code,
    memberOrg: doc.memberOrg,
    holdingOrg: doc.holdingOrg
  });
}

MessageTemplateSchema.index({ code: 1, memberOrg: 1, holdingOrg: 1 }, { unique: true });
const MessageTemplateModel = mongoose.model<MessageTemplateDocument>('MessageTemplate', MessageTemplateSchema);

export default MessageTemplateModel;
