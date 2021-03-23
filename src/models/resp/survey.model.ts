import mongoose from 'mongoose';
import cuid from 'cuid';
import DataDomain from '../../enums/DataDomain';
import { codeSchema, DEFAULT_MODEL_OPTIONS, isUnique, statusSchema, stringEnumSchema } from '../../lib/mongoose.util';
import { SurveyDocument, SurveyType } from './survey.types';
import _ from 'lodash'


export const SurveySchema = new mongoose.Schema<SurveyDocument>(
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

    originalId: { //only used in survey version
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Survey',
    },

    previewId: {
      type: String,
      default: cuid,
    },

    code: codeSchemaInternal(),
    name: { type: String, required: true },
    title: { type: String },
    displayName: { type: String },
    dataDomain: stringEnumSchema(DataDomain, { required: true }),
    introText: { type: String },
    showLogo: { type: Boolean },

    surveyType: stringEnumSchema(SurveyType, { required: true }),

    surveyPages: [Object],

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
  DEFAULT_MODEL_OPTIONS
);


function codeSchemaInternal(): any {
  return codeSchema({
    isUniqueFn: isUniqueCode
  });
}

async function isUniqueCode(doc: SurveyDocument, code: any): Promise<boolean> {
  return await isUnique(SurveyModel, doc, {
    code: code,
    memberOrg: doc.memberOrg,
    holdingOrg: doc.holdingOrg,
    dataDomain: doc.dataDomain
  });
}

//needs to happen before index is created
export const SurveyVersionSchema = _.cloneDeep(SurveySchema);

SurveySchema.index({ code: 1, memberOrg: 1, holdingOrg: 1, dataDomain: 1 }, { unique: true })
const SurveyModel = mongoose.model<SurveyDocument>('Survey', SurveySchema);
export default SurveyModel;
