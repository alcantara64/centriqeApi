import { Document, Model } from "mongoose";
import ModelStatus from "../../enums/ModelStatus";

export interface RespType {
  holdingOrg?: string;
  memberOrg?: string;

  name: string;
  displayName: string;
  category: string;
  questionNumber: number;
  questionNumberOrderToDisplay: number;
  questionText: string;
  questionType: string;
  questionTypeStructure: {
    label: string;
    id: string;
    name: string;
    type: string;
    maxLength: number;
  },
  required: boolean;
  status: ModelStatus;

  createdBy?: string;
  modifiedBy?: string;
}
export interface RespTypeDocument extends RespType, Document { }
export interface RespTypeModel extends Model<RespTypeDocument> { }
