import { Document, Model } from "mongoose";
import DataDomain from "../../enums/DataDomain";
import ModelStatus from "../../enums/ModelStatus";
import { MessageChannel } from "../message/message.types";
import { RecipientValidationDocument } from "../message/recipient-validation.types";

export interface Customer {
  holdingOrg?: string;
  memberOrg?: string;
  code: string;
  unsubscribeList: Array<UnsubscribeRecord>,
  prefMsgChannel: MessageChannel;


  messaging?: {
    email?: CustomerMessagingValidity,
    cellPhone?: CustomerMessagingValidity,

    channel?: {
      email?: CustomerMessagingUnsubscribe,
      sms?: CustomerMessagingUnsubscribe,
      whatsApp?: CustomerMessagingUnsubscribe
    }
  }

  email: string;
  cellPhone: string;

  title?: string;
  firstName?: string,
  lastName?: string,
  middleName?: string;
  fullName?: string;

  status: ModelStatus;

  createdBy?: string;
  modifiedBy?: string;
}
export interface CustomerDocument extends Customer, Document {
  isUnsubscribed: (this: CustomerDocument, unsubscribeRecord: UnsubscribeRecordNoStatus) => boolean;
  isRecipientValid: (this: CustomerDocument, channel: MessageChannel) => boolean;
}



export interface CustomerModel extends Model<CustomerDocument> { }



export interface UnsubscribeRecordNoStatus {
  dataDomain: DataDomain;
  channel: MessageChannel;
  holdingOrg?: string;
  memberOrg?: string;
}

export interface UnsubscribeRecord extends UnsubscribeRecordNoStatus {
  status: ModelStatus
}


export interface CustomerMessagingUnsubscribe {
  isUnsubscribed?: boolean;
  unsubscribeHistory: CustomerMessagingUnsubscribeHistory[]
}
export interface CustomerMessagingUnsubscribeDocument extends CustomerMessagingUnsubscribe, Document { }

export interface CustomerMessagingUnsubscribeHistory {
  isUnsubscribed: boolean;
  createdAt: Date;
}


export interface CustomerMessagingValidity {
  isValid: boolean;
  recipientValidation: string | RecipientValidationDocument;
}
export interface CustomerMessagingValidityDocument extends CustomerMessagingValidity, Document { }
