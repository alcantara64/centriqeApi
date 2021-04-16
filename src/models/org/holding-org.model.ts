import mongoose from 'mongoose';
import { DEFAULT_MODEL_OPTIONS, codeSchema, isUnique, emailSchema, statusSchema, intSchema, stringEnumSchema } from '../../lib/mongoose.util';
import { BusinessVertical, HoldingOrgDocument } from './holding-org.types';

import validator from 'validator';
import { DataAttributeProviderType, DataAttributeType } from '../system/system-config.types';
import { AppModule, DashboardModule } from './org.types';
import { DataDomainGroupCode, dataDomainGroupMapByCode } from '../datadomain/data-domain-group.types';
import { dataDomainToOldDataDomainCodeByMap } from '../datadomain/data-domain.types';


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
      customer: { type: DataDomainSchema },
      product: { type: DataDomainSchema },
      revenue: { type: DataDomainSchema },
      cost: { type: DataDomainSchema },
      communication: { type: DataDomainSchema },
      response: { type: DataDomainSchema },
      nps: { type: DataDomainSchema },
      profitEdge: { type: DataDomainSchema },
      marketPlace: { type: DataDomainSchema }
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
    status: statusSchema(),
    orgTags: {type: [String]}
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


HoldingOrgSchema.pre('save', async function () {
  updateDataDomainConfig(<HoldingOrgDocument>this);
});

const HoldingOrgModel = mongoose.model<HoldingOrgDocument>('HoldingOrg', HoldingOrgSchema);
export default HoldingOrgModel


/**
 * Update legacy dataDomainConfig attribute. Eventually we will move away from this but
 * the current UI still needs this populated
 * TODO: remove dataDomainConfig
 * @param doc
 */
function updateDataDomainConfig(doc: HoldingOrgDocument): void {
  if (doc.dataDomainGroupConfig != null) {
    for (let item of doc.dataDomainGroupConfig) {
      const { code, holdingOrgLevel, memberOrgLevel } = item;

      const dataDomainGroup = dataDomainGroupMapByCode.get(code);
      if (dataDomainGroup != null) {
        const dataDomainCodes = dataDomainGroup.dataDomainCodes;
        for (let dataDomain of dataDomainCodes) {
          const oldDataDomain = dataDomainToOldDataDomainCodeByMap.get(dataDomain)
          if (oldDataDomain) {
            (<any>doc.dataDomainConfig)[oldDataDomain] = {
              holdingOrgLevel,
              memberOrgLevel
            }
          }
        }
      }

    }
  }
}
