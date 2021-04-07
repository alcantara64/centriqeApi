import { Document, Model } from "mongoose";
import DataDomain from "../../enums/DataDomain";
import ModelStatus from "../../enums/ModelStatus";


export interface SurveyInstance {
  holdingOrg?: string;
  memberOrg?: string;

  surveyInstanceType: SurveyInstanceType;
  customer: string;
  customerCode: string;

  messageEvent: string;

  survey: string;
  surveyCode: string;
  surveyVersion: string;

  dataDomain: DataDomain;

  feedback?: any;
  /**2021-02-11 Adding two fields for tracking the Survey progress */
  totalSurveyPages?:number;
  currentSurveyPage?:number;

  validInDays?: number;

  submissionStatus: SurveySubmissionStatus;
  status: ModelStatus;

  createdAt?: Date;
}
export interface SurveyInstanceDocument extends SurveyInstance, Document { }
export interface SurveyInstanceModel extends Model<SurveyInstanceDocument> { }



export interface CampaignSurveyInstance extends SurveyInstance {
  readonly surveyInstanceType: SurveyInstanceType.CAMPAIGN;

  campaign: string;
  campaignCode: string;
  campaignVersion: string;
}
export interface CampaignInstanceDocument extends CampaignSurveyInstance, Document { }

export interface InteractiveSurveyInstance extends SurveyInstance {
  readonly surveyInstanceType: SurveyInstanceType.INTERACTIVE;
}
export interface InteractiveSurveyInstanceDocument extends InteractiveSurveyInstance, Document { }


export enum SurveySubmissionStatus {
  pending = "pending",
  inProgress = "inProgress",
  submitted = "submitted",
  expired = "expired"
}

export enum SurveyInstanceType {
  CAMPAIGN = "campaignSurveyInstance",
  INTERACTIVE = "interactiveSurveyInstance"
}
