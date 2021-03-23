
import mongoose from 'mongoose';
import { stringEnumSchema } from '../../lib/mongoose.util';
import { getIsTrueValid } from './recipient-validation.methods';
import { RecipientValidationDocument, RecipientValidationOrigin, RecipientValidationReasonDocument, RecipientValidationType } from './recipient-validation.types';



const RecipientValidationReason = new mongoose.Schema<RecipientValidationReasonDocument>(
  {
    origin: stringEnumSchema(RecipientValidationOrigin, { required: true }),
    isValid: { type: Boolean, required: true },

    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HoldingOrg'
    },

    reasonDetails: { type: Object },
  },
  {
    timestamps: true
  }
)

const RecipientValidation = new mongoose.Schema<RecipientValidationDocument>(
  {
    validationType: stringEnumSchema(RecipientValidationType, { required: true }),
    value: {
      type: String,
      required: true,
      unique: true,
      //validate: isUniqueValue //no validation done to speed things up
    },
    isValid: { type: Boolean, required: true },
    isManualOverride: { type: Boolean },
    isValidOverride: { type: Boolean },

    reasonHistory: [RecipientValidationReason]
  },
  {
    timestamps: true
  }
);


RecipientValidation.methods.getIsTrueValid = getIsTrueValid;
const RecipientValidationModel = mongoose.model<RecipientValidationDocument>('RecipientValidation', RecipientValidation);


// async function isUniqueValue(doc: any, value: any): Promise<boolean> {
//   return await isUnique(RecipientValidationModel, doc, {
//     value: value,
//   });
// }

export {
  RecipientValidationModel
};

