import { FILE_UPLOAD_STATUS } from './../../enums/FileUpload';
import mongoose from 'mongoose';
import { FILE_PROCESS_TYPE } from './../../enums/FileUpload';
import { intSchema, stringEnumSchema, stringSchema } from '../../lib/mongoose.util';



const FileUploadSchema: any = new mongoose.Schema(
  {
    fileName:stringSchema(),
    internalFileName: {type: String},
    status: stringEnumSchema(FILE_UPLOAD_STATUS, { required: true, defaultValue:FILE_UPLOAD_STATUS.PENDING }),
    fileUrl: stringSchema(),
    size: intSchema(),
    fileProcessType:stringEnumSchema(FILE_PROCESS_TYPE, { required: true, defaultValue:FILE_PROCESS_TYPE.CUSTOMER_LOAD }),
    holdingOrg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HoldingOrg',
    },
    code:stringSchema(),
    fileReference:stringSchema(),
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
  }
);


export const FileUploadModel = mongoose.model('FileUpload', FileUploadSchema);


