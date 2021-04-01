import { Document, Model } from "mongoose";
import DataDomain from "../../enums/DataDomain";
import ModelStatus from "../../enums/ModelStatus";
import { EmailTemplate, SmsTemplate, WhatsAppTemplate } from "../message/message-template.types";


export interface Survey {
  previewId: string;
  holdingOrg?: string;
  memberOrg?: string;
  dataDomain: DataDomain;
  code: string;
  name: string;
  title?: string;
  displayName?: string;
  introText: string;
  showLogo?: boolean;
  isEmailEnabled?: boolean,
  isWhatsAppEnabled?: boolean,
  isSMSEnabled?: boolean,
  channel: {
    email?: EmailTemplate;
    sms?: SmsTemplate
    whatsApp?: WhatsAppTemplate;
  },
  surveyType: SurveyType;

  surveyPages: [any];

  status: ModelStatus;
  createdBy?: string;
  modifiedBy?: string;
}
export interface SurveyDocument extends Survey, Document { }
export interface SurveyModel extends Model<SurveyDocument> { }

export interface SurveyVersion extends Survey {
  originalId: string;
}
export interface SurveyVersionDocument extends SurveyVersion, Document { }
export interface SurveyVersionModel extends Model<SurveyVersionDocument> { }


export enum SurveyType {
  single = 'single',
  multi = 'multi',
}
