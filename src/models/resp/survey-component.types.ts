import { Document, Model } from "mongoose";
import DataDomain from "../../enums/DataDomain";
import ModelStatus from "../../enums/ModelStatus";

export interface SurveyComponent {
  holdingOrg?: string;
  memberOrg?: string;
  componentCategory: SurveyComponentCategory
  dataDomain: DataDomain;
  code: string;
  name: string;
  displayName: string;

  status: ModelStatus;

  createdBy?: string;
  modifiedBy?: string;
}
export interface SurveyComponentDocument extends SurveyComponent, Document { }
export interface SurveyComponentModel extends Model<SurveyComponentDocument> { }

export enum SurveyComponentCategory {
  QUESTION = "question",
  SECTION = "section"
}

export interface SurveyQuestionComponent extends SurveyComponent {
  readonly componentCategory: SurveyComponentCategory.QUESTION
  questionNumber: number;
  questionText: string;
  subQuestionText?: string;
  questionType: string;
  questionTypeStructure: any;
  required: boolean;
  responseIdentifierText: string;
  questionNumberOrderToDisplay: number;
}

export interface SurveySectionComponent extends SurveyComponent {
  readonly componentCategory: SurveyComponentCategory.SECTION
  sectionNumber: number;
  sectionHeading: string;
  sectionQuestions: Array<SurveyQuestionComponent>;
}
