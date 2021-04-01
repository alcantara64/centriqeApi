/** Changes to this file will always have to be reviewed in campaign-version.model.ts also!! */
import _ from 'lodash';
import mongoose from 'mongoose';
import DataDomain from '../../enums/DataDomain';
import ModelStatus from '../../enums/ModelStatus';
import { codeSchema, intSchema, isUnique, statusSchema, stringEnumSchema, stringSchema } from '../../lib/mongoose.util';
import searchUtil from '../../lib/search.util';
import { QueryLimiter } from '../../lib/security.util';
import { MessageChannel } from '../../models/message/message.types';
import { getEndDateInTimeZone, getStartDateInTimeZone } from './campaign.methods';
import { CampaignDocument, ScheduleType } from './campaign.types';
import HttpBadRequestException from '../../exceptions/http/HttpBadRequestException'

const filterCriteronSchema = new mongoose.Schema(
  {
    rowNumber: intSchema({ required: true }),
    startParenthesisCount: intSchema({ required: true, defaultValue: 0 }),
    endParenthesisCount: intSchema({ required: true, defaultValue: 0 }),
    attributeName: stringSchema({ required: true }),
    operator: {
      type: String,
      enum: ["=", "<>", "!=", ">", "<", "<=", ">=", 
             "in list", "not in list",  "In List", "Not In List",  
             "days before", "Days Before", "days after", "Days After", "days after (no year)", "days before (no year)",
             "contains","Contains","Does not contain","does not contain",
             "Is populated","is populated","Is not populated","is not populated"]
    },
    values: { type: Array, required: true },
    logicalConcatenation: {
      type: String,
      enum: ['and', 'or', '', null, 'AND', 'OR'],
      default: null
    },
  },
  //no need for an id. the array will always be replaced entirely with an update
  { _id: false }
);


const SchedulePatternSchema = new mongoose.Schema(
  {
    timeZone: { type: String, required: true },
    startDate: { type: Date, required: true },
    sendTime: { type: String, required: true },
    endDate: { type: Date },
    endAfterOccurrenceCount: { type: Number },
  },
  { discriminatorKey: 'scheduleType', _id: false });



export const CampaignSchema = new mongoose.Schema(
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

    originalId: { //only used by campaign-version document
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
    },

    code: codeSchemaInternal(),
    name: { type: String, required: true },
    description: { type: String },


    channel: stringEnumSchema(MessageChannel, { required: true, defaultValue: MessageChannel.EMAIL }),

    filter: {
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

      criteria: {
        type: [filterCriteronSchema]
      },
      query: {
        type: String
      }
    },

    schedulePattern: SchedulePatternSchema,

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
    },
    lastEventDate: { type: Date, required: false },
    totalEvents:{ type: Number, required: false },
    validInDays:{type: Number, required: false }
  },
  {
    timestamps: true,
    discriminatorKey: "dataDomain"
  }
);
/**2021-01-13 - Frank - Adding any any as quick hack */
SchedulePatternSchema.methods.getStartDateInTimeZone = <any>getStartDateInTimeZone;
SchedulePatternSchema.methods.getEndDateInTimeZone = <any>getEndDateInTimeZone;

CampaignSchema.pre('save', async function () {
  setFilterQuery(<CampaignDocument>this);
});
const CampaignModel = mongoose.model<CampaignDocument>('Campaign', CampaignSchema);


/******************* data based on dataDomain ********************/
export const CommCampaignSchema = new mongoose.Schema(
  {
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MessageTemplate',
      required: true
    }
  }
);
CampaignModel.discriminator(DataDomain.COMM, CommCampaignSchema);

export const RespCampaignSchema = new mongoose.Schema(
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
    }
  }
);
CampaignModel.discriminator(DataDomain.RESP, RespCampaignSchema);

export const NpsCampaignSchema = new mongoose.Schema(
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
    }
  }
);
CampaignModel.discriminator(DataDomain.NPS, NpsCampaignSchema);
/******************* data based on dataDomain ********************/





/****************** scheulde patterns ************************/

const docSchedulePattern: any = CampaignSchema.path('schedulePattern');

const oneTimeSchedule = new mongoose.Schema({
}, { _id: false });
docSchedulePattern.discriminator(ScheduleType.ONE_TIME, oneTimeSchedule);


const dailySchedule = new mongoose.Schema({
  dayRecurrenceCount: intSchema(),
}, { _id: false });
docSchedulePattern.discriminator(ScheduleType.DAILY, dailySchedule);


const weeklySchedule = new mongoose.Schema({
  weekRecurrenceCount: intSchema({ required: true }),
  dayOfWeek: {
    type: [Boolean],
    required: true,
    validate: [
      {
        validator: (v: any) => { return v.length == 7 },
        message: props => `The dayOfWeek attribute needs to contain 7 values`,
        type: 'format'
      }
    ]
  }
}, { _id: false });
docSchedulePattern.discriminator(ScheduleType.WEEKY, weeklySchedule);


const monthlySchedule = new mongoose.Schema({
  byDayOfMonth: {
    dayOfMonth: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
    },
    monthRecurrenceCount: Number,
  },

  byWeekDay: {
    occurence: {
      type: String,
      enum: ['first', 'second', 'third', 'fourth', 'last'],
    },
    weekDay: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5, 6],
    },
    monthRecurrenceCount: intSchema()
  }


}, { _id: false });
docSchedulePattern.discriminator(ScheduleType.MONTHLY, monthlySchedule);


const yearlySchedule = new mongoose.Schema({
  yearRecurrenceCount: intSchema({ required: true }),

  byMonthDay: {
    month: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    },
    day: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
    }
  },

  byMonthWeekDay: {
    occurence: {
      type: String,
      enum: ['first', 'second', 'third', 'fourth', 'last'],
    },
    weekDay: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5, 6],
    },
    month: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    },
  }


}, { _id: false });
docSchedulePattern.discriminator(ScheduleType.YEARLY, yearlySchedule);


/****************** scheulde patterns ************************/



function codeSchemaInternal(): any {
  return codeSchema({
    isUniqueFn: isUniqueCode
  });
}

async function isUniqueCode(doc: any, code: any): Promise<boolean> {
  return await isUnique(CampaignModel, doc, {
    code: code,
    memberOrg: doc.memberOrg,
    holdingOrg: doc.holdingOrg
  });
}


/**
 * Setting the mongodb query along with the filter.
 * @param value The filterCriteria
 */
function setFilterQuery(doc: CampaignDocument): void {
  const { criteria, holdingOrg, memberOrg } = doc.filter;

  if(!holdingOrg && !memberOrg) {
    throw new HttpBadRequestException("At least one org has to be populated. Either filter.holdingOrg or filter.memberOrg")
  }

  //MongoDb does not allow to store "$or" or "$and" as attribute names. Need to store as JSON value
  doc.filter.query = JSON.stringify(generateCustomerFilterQuery(
    criteria,
    {
      holdingOrg: holdingOrg,
      memberOrg: memberOrg
    }
  ));
}


export function generateCustomerFilterQuery(criteria: any, queryLimiter: QueryLimiter): any {
  let query = searchUtil.convertCriteriaToMongooseQueryAndAttachOrgLimiter(criteria, queryLimiter);

  //extending query so that only customers with valid email and customer who are still subscribed are included
  //the check currently is only going against the email channel. the other ones are not used at this point anyway
  //TODO: extend this to support all channels -- not sure how to provide details on the UI
  query = {
    $and: [
      query,
      //the flag might not be set at all. in that case we want to include the customer -> $ne
      { 'messaging.email.isValid': { $ne: false } },
      //the flag might not be set at all. in that case we want to include the customer -> $ne
      { 'messaging.channel.email.isUnsubscribed': { $ne: true } },
      { status: ModelStatus.ACTIVE }
    ]
  }

  return query
}

//needs to happen before index
export const CampaignVersionSchema = _.cloneDeep(CampaignSchema);
CampaignSchema.index({ code: 1, memberOrg: 1, holdingOrg: 1 }, { unique: true })


export default CampaignModel;
