import { Document } from "mongoose";
import { MessageDocument } from "./message.types";



export interface RecipientValidation {
  validationType: RecipientValidationType;
  value: string;

  isValid: boolean; //is the recipient valid?
  isManualOverride?: boolean; //is a manual override active?
  isValidOverride?: boolean; //what's the value of the manual override?
  reasonHistory: RecipientValidationReason[];
}
export interface RecipientValidationDocument extends RecipientValidation, Document {
  getIsTrueValid: (this: RecipientValidationDocument) => boolean;
}


export enum RecipientValidationType {
  EMAIL = 'emailValidation',
  CELL_PHONE = 'cellPhoneValidation'
}

export enum RecipientValidationOrigin {
  MAILGUN_VALIDATION = 'mailgunValidation',
  DELIVERY_FEEDBACK = 'deliveryFeedback'
}


export interface RecipientValidationReason {
  origin: RecipientValidationOrigin;
  isValid: boolean;

  message?: string | MessageDocument;

  reasonDetails: any;
  createdAt?: Date;
}
export interface RecipientValidationReasonDocument extends RecipientValidation, Document {}
