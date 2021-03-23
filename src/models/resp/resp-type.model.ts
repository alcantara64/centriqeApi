import mongoose from 'mongoose';
import { DEFAULT_MODEL_OPTIONS, intSchema, statusSchema } from '../../lib/mongoose.util';
import { RespTypeDocument } from './resp-type.types';


const customerSchema = new mongoose.Schema(
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

    name: { type: String },
    displayName: { type: String },
    questionNumber: intSchema(),
    questionNumberOrderToDisplay: intSchema(),
    questionText: { type: String },
    questionType: { type: String },
    questionTypeStructure: {
      label: { type: String },
      id: { type: String },
      name: { type: String },
      type: { type: String },
      maxLength: intSchema()
    },
    required: Boolean,


    /**
     * TODO: needs to be removed again. It's just a placeholder so Gaurav can continue working on the UI.
     */
    respTypeData: { type: Object },
    surveyData: { type: Object },

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
  DEFAULT_MODEL_OPTIONS);


const RespTypeModel = mongoose.model<RespTypeDocument>('RespType', customerSchema);

export default RespTypeModel;


// export interface ResponseTypeStruct extends SurveyQuestion, SurveySection {
//   _id: string;
//   dataDomain: string;
//   holdingOrg: string;
//   name: string;
//   displayName: string;
//   category: string; //question or section
//   status: number;
//   }
