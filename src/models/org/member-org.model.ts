
import mongoose from 'mongoose';
import { DEFAULT_MODEL_OPTIONS, codeSchema, isUnique, statusSchema, emailSchema, stringEnumSchema } from '../../lib/mongoose.util';
import { dashboardConfigSchema } from './holding-org.model';
import { MemberOrgDocument } from './member-org.types';
import { AppModule } from './org.types';


const memberOrgSchema = new mongoose.Schema<MemberOrgDocument>({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  code: codeSchemaInternal(),
  addressLine1: String,
  addressLine2: String,
  zipCode: String,
  city: String,
  state: String,
  phone: String,
  mobile: String,
  country: String,
  fax: String,
  tollFreeNumber: String,
  email: String,
  websiteAddress: String,
  subscribedModuleCodes: stringEnumSchema(AppModule, { stringArray: true, required: true }),
  inheritSubscribedModules: { type: Boolean, default: true, required: true },
  defaultEmailSender: emailSchema({ emailValidation: { allowDisplayName: true } }),
  defaultWhatsAppSender: { type: String },
  defaultSmsSender: { type: String },
  status: statusSchema(),
  holdingOrg: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HoldingOrg',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  dashboardConfig: [dashboardConfigSchema],
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
  return await isUnique(MemberOrgModel, doc, {
    code: code,
    holdingOrg: doc.holdingOrg
  });
}

memberOrgSchema.index({ code: 1, holdingOrg: 1 }, { unique: true });

const MemberOrgModel = mongoose.model("MemberOrg", memberOrgSchema);
export default MemberOrgModel;
