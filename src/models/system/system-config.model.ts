import mongoose from 'mongoose';
import { intSchema, statusSchema, stringEnumSchema, stringSchema } from '../../lib/mongoose.util';
import { dashboardConfigSchema } from '../org/holding-org.model';
import { SystemConfigDocument, DataAttributeGroupDocument, DataAttributeDocument, DataAttributeType, DataAttributeProviderType, DataEnumTypeDocument } from './system-config.types';



const DataAttributeGroupSchema = new mongoose.Schema<DataAttributeGroupDocument>(
  {
    code: {
      type: String,
      required: true
    },

    name: {
      type: String,
      required: true
    },

    detailViewOrder: intSchema({ required: true })
  },
  {
    timestamps: true
  }
);

const DataAttributeSchema = new mongoose.Schema<DataAttributeDocument>(
  {
    code: {
      type: String,
      required: true
    },

    name: {
      type: String,
      required: true
    },

    shortName: {
      type: String,
      required: true
    },
    groupCode: {
      type: String,
      required: true
    },
    detailViewOrder: intSchema({ required: true }),
    type: stringEnumSchema(DataAttributeType, { required: true }),
    dataProviderType: stringEnumSchema(DataAttributeProviderType, { required: true, defaultValue: DataAttributeProviderType.NONE }),
    data: [Object]
  },
  {
    timestamps: true
  }
);
const DataEnumTypesSchema = new mongoose.Schema<DataEnumTypeDocument>(
  {
    code: stringSchema({required:true}),
    name: stringSchema({required:true}),
    status: statusSchema(),
    type: stringEnumSchema(DataAttributeType, { required: true }),
    dataProviderType: stringEnumSchema(DataAttributeProviderType, { required: true, defaultValue: DataAttributeProviderType.NONE }),
    data: [Object]
  },
  {
    timestamps: true
  }
);

const SystemConfigSchema = new mongoose.Schema<SystemConfigDocument>(
  {
    dataConfig: {
      customer: {
        dataGroups: [DataAttributeGroupSchema],
        dataAttributes: [DataAttributeSchema],
        dataEnumTypes: [DataEnumTypesSchema],
      }
    },
    dashboardConfig:dashboardConfigSchema
  },
  {
    timestamps: true,
    collection: "systemconfig"
  }
);


const SystemConfigModel = mongoose.model<SystemConfigDocument>('SystemConfig', SystemConfigSchema);
export default SystemConfigModel;
