import mongoose from 'mongoose';
import { DEFAULT_MODEL_OPTIONS, codeSchema, isUnique, emailSchema, statusSchema, intSchema, stringEnumSchema } from '../../lib/mongoose.util';
import { BusinessVertical, HoldingOrgDocument } from './holding-org.types';

import validator from 'validator';
import { DataAttributeProviderType, DataAttributeType } from '../system/system-config.types';
import { AppModule, DashboardModule } from './org.types';
import { DataDomainGroupCode } from '../datadomain/data-domain-group.types';


const DataDomainSchema = new mongoose.Schema(
  {
    holdingOrgLevel: {
      type: Boolean,
      required: true
    },
    memberOrgLevel: {
      type: Boolean,
      required: true
    }
  },
  { _id: false }
);

export const dashboardConfigSchema = new mongoose.Schema(
  {
    module: stringEnumSchema(DashboardModule),
    dashboardName: { type: String },
    dashboardLink: { type: String },
    height: { type: String },
    maxWidth: { type: String },
    minWidth: { type: String },
  },
  { _id: false }
);


const DataDomainGroupConfigItemSchema = new mongoose.Schema(
  {
    code: stringEnumSchema(DataDomainGroupCode, { required: true }),
    holdingOrgLevel: {
      type: Boolean,
      required: true
    },
    memberOrgLevel: {
      type: Boolean,
      required: true
    }
  },
  { _id: false }
);



const DataAttributeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true
    },

    name: {
      type: String,
      required: true
    },

    shortName: {
      type: String,
      required: true
    },

    groupCode: {
      type: String,
      required: true
    },

    detailViewOrder: intSchema(),

    type: stringEnumSchema(DataAttributeType, { required: true }),
    dataProviderType: stringEnumSchema(DataAttributeProviderType),
    data: Object,

    loadAttributeName: String,
    useInTableView: {
      type: Boolean,
      default: false,
      required: true
    },
    useInDetailView: {
      type: Boolean,
      default: false,
      required: true
    },
    useInCampaignFilter: {
      type: Boolean,
      default: false,
      required: true
    },
    tableViewOrder: intSchema()
  }
);



const HoldingOrgSchema = new mongoose.Schema<HoldingOrgDocument>(
  {
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
    country: String,
    fax: String,
    tollFreeNumber: String,
    email: emailSchema(),
    websiteAddress: String,
    subscribedModuleCodes: stringEnumSchema(AppModule, { stringArray: true, required: true }),
    dataDomainConfig: {
      //attribute name changes/ adjustments also need to be reflected in enum DataDomain.ts
      customer: { type: DataDomainSchema, required: true },
      product: { type: DataDomainSchema, required: true },
      revenue: { type: DataDomainSchema, required: true },
      cost: { type: DataDomainSchema, required: true },
      communication: { type: DataDomainSchema, required: true },
      response: { type: DataDomainSchema, required: true },
      nps: { type: DataDomainSchema, required: true },
      profitEdge: { type: DataDomainSchema, required: true },
      marketPlace: { type: DataDomainSchema, required: true }
    },
    dataDomainGroupConfig: [DataDomainGroupConfigItemSchema],
    defaultEmailSender: emailSchema({ emailValidation: { allowDisplayName: true } }),
    defaultWhatsAppSender: { type: String },
    defaultSmsSender: { type: String },

    logoUrl: {
      type: String,
      validate:
      {
        validator: (v: any) => {
          let isValid = false;
          isValid = v ? validator.isURL(v) : v === null || v === ''
          return isValid;
        },
        message: (props: any) => `${props.value} is not a valid Logo URL`,
        type: 'format'
      }
    },
    //there was an error, this is an array but should be a single value; keeping it for now
    bussinessVertical: stringEnumSchema(BusinessVertical, { stringArray: true }),

    dataConfig: {
      customer: {
        dataAttributes: [DataAttributeSchema]
      }
    },
    dashboardConfig: [dashboardConfigSchema],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: statusSchema()
  },
  DEFAULT_MODEL_OPTIONS
);


function codeSchemaInternal(): any {
  return codeSchema({
    isUniqueFn: isUniqueCode,
    isUnique: true
  });
}

async function isUniqueCode(doc: any, code: any): Promise<boolean> {
  return await isUnique(HoldingOrgModel, doc, {
    code: code
  });
}

const HoldingOrgModel = mongoose.model<HoldingOrgDocument>('HoldingOrg', HoldingOrgSchema);
export default HoldingOrgModel
