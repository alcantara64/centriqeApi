import mongoose from 'mongoose';
import DataDomain from '../../enums/DataDomain';
import { statusSchema, stringEnumSchema } from '../../lib/mongoose.util';
import { SurveyInstanceDocument, SurveyInstanceType, SurveySubmissionStatus } from './survey-instance.types';

const SurveyInstanceSchema = new mongoose.Schema(
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

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },

    messageEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MessageEvent'
    },


    survey: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Survey',
      required: true
    },
    surveyCode: {
      type: String,
      required: true
    },

    surveyVersion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SurveyVersion',
      required: true
    },

    dataDomain: stringEnumSchema(DataDomain, { required: true }),

    feedback: {
      type: Object
    },
    /**2021-02-11 Adding two fields for tracking the Survey progress */
    totalSurveyPages:{
       type:mongoose.Schema.Types.Number,
       required:false
    },

    currentSurveyPage:{
      type:mongoose.Schema.Types.Number,
      required:false
   },

    validInDays: { type: Number, required: false },

    submissionStatus: stringEnumSchema(SurveySubmissionStatus, { required: true, defaultValue: SurveySubmissionStatus.pending }),

    status: statusSchema(),
  },
  {
    timestamps: true,
    discriminatorKey: "surveyInstanceType"
  }
);

const SurveyInstanceModel = mongoose.model<SurveyInstanceDocument>('SurveyInstance', SurveyInstanceSchema);





const CampaignSurveySchema = new mongoose.Schema(
  {
    campaignVersion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CampaignVersion',
      required: true
    },

    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true
    },
    campaignCode: {
      type: String,
      required: true
    },
  }
);
SurveyInstanceModel.discriminator(SurveyInstanceType.CAMPAIGN, CampaignSurveySchema);


const InteractiveSurveySchema = new mongoose.Schema({});
SurveyInstanceModel.discriminator(SurveyInstanceType.INTERACTIVE, InteractiveSurveySchema);


export default SurveyInstanceModel;
