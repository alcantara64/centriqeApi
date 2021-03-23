import mongoose from 'mongoose';
import DataDomain from '../../enums/DataDomain';
import { codeSchema, intSchema, isUnique, statusSchema, stringEnumSchema } from '../../lib/mongoose.util';
import { SurveyComponentCategory, SurveyComponentDocument, SurveyComponentModel } from './survey-component.types';


const SurveyComponentSchema = new mongoose.Schema(
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

    dataDomain: stringEnumSchema(DataDomain, {required: true}),

    code: codeSchemaInternal(),
    name: { type: String },
    displayName: { type: String },

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
    discriminatorKey: 'componentCategory'
  }
);

const SurveyComponentModel = mongoose.model<SurveyComponentDocument>('SurveyComponent', SurveyComponentSchema);


const QuestionSchema = new mongoose.Schema(
  {
    questionNumber: intSchema(),
    questionText: String,
    subQuestionText: String,
    questionType: String,
    questionTypeStructure: Object,

    required: {
      type: Boolean,
      required: true
    },

    responseIdentifierText: {
      type: String,
      required: true
    },

    questionNumberOrderToDisplay: intSchema()
  },
  {
    timestamps: true //in case they are part of SectionSchema
  }
)
SurveyComponentModel.discriminator(SurveyComponentCategory.QUESTION, QuestionSchema);

const SectionSchema = new mongoose.Schema(
  {
    sectionNumber: intSchema(),
    sectionHeading: String,
    sectionQuestions: [QuestionSchema]

  }
)
SurveyComponentModel.discriminator(SurveyComponentCategory.SECTION, SectionSchema);


function codeSchemaInternal(): any {
  return codeSchema({
    isUniqueFn: isUniqueCode
  });
}

async function isUniqueCode(doc: SurveyComponentDocument, code: any): Promise<boolean> {
  return await isUnique(SurveyComponentModel, doc, {
    code: code,
    memberOrg: doc.memberOrg,
    holdingOrg: doc.holdingOrg,
    dataDomain: doc.dataDomain
  });
}

SurveyComponentSchema.index({ code: 1, memberOrg: 1, holdingOrg: 1, dataDomain: 1 }, { unique: true });
export default SurveyComponentModel;

