import mongoose from 'mongoose';
import DataDomain from '../../enums/DataDomain';
import { codeSchema, emailSchema, isUnique, statusSchema, stringEnumSchema } from '../../lib/mongoose.util';
import { MessageChannel } from '../../models/message/message.types';
import { isUnsubscribed } from './customer.methods';
import { CustomerDocument, CustomerMessagingUnsubscribeDocument, CustomerMessagingValidityDocument } from './customer.types';

const UnsubscribeRecordSchema: any = new mongoose.Schema(
  {
    dataDomain: stringEnumSchema(DataDomain, { required: true }),
    channel: stringEnumSchema(MessageChannel, { required: true }),

    holdingOrg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HoldingOrg',
    },

    memberOrg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MemberOrg',
    },

    status: statusSchema()
  },
  {
    timestamps: true,
  }
);

const CustomerMessagingUnsubscribeSchema = new mongoose.Schema<CustomerMessagingUnsubscribeDocument>(
  {
    isUnsubscribed: { type: Boolean },
    unsubscribeHistory: [{
      isUnsubscribed: { type: Boolean, required: true },
      createdAt: { type: Date, required: true }
    }],
  },
  { _id: false }
)

const CustomerMessagingValiditySchema = new mongoose.Schema<CustomerMessagingValidityDocument>(
  {
    isValid: { type: Boolean },
    recipientValidation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecipientValidation'
    },
  },
  { _id: false }
)


const CustomerSchema = new mongoose.Schema<CustomerDocument>(
  {
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

    code: codeSchemaInternal(),
    unsubscribeList: [UnsubscribeRecordSchema],

    prefMsgChannel: stringEnumSchema(MessageChannel, { defaultValue: MessageChannel.EMAIL }),
    messaging: {
      email: CustomerMessagingValiditySchema,
      cellPhone: CustomerMessagingValiditySchema,

      channel: {
        email: CustomerMessagingUnsubscribeSchema,
        sms: CustomerMessagingUnsubscribeSchema,
        whatsApp: CustomerMessagingUnsubscribeSchema
      }
    },

    email: emailSchemaInternal(),
    cellPhone: { type: String },

    title: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    middleName: { type: String },
    fullName: { type: String },


    status: statusSchema(),

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
    strict: false
  }
);



function codeSchemaInternal(): any {
  return codeSchema({
    isUniqueFn: isUniqueCode
  });
}

async function isUniqueCode(doc: any, code: any): Promise<boolean> {
  return await isUnique(CustomerModel, doc, {
    code: code,
    memberOrg: doc.memberOrg,
    holdingOrg: doc.holdingOrg
  });
}


function emailSchemaInternal(): any {
  return emailSchema({});
}


CustomerSchema.methods.isUnsubscribed = isUnsubscribed;
CustomerSchema.index({ code: 1, memberOrg: 1, holdingOrg: 1 }, { unique: true });
const CustomerModel = mongoose.model<CustomerDocument>('Customer', CustomerSchema);

export default CustomerModel;
