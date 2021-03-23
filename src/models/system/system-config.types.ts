import { DashboardModule } from './../org/org.types';
import { Document } from "mongoose";
import ModelStatus from 'src/enums/ModelStatus';


//There is only one system config object -- this is it's ID
export const SYSTEM_CONFIG_ID = "000000000000000000000000"



export interface SystemConfig {
  dataConfig: {
    customer: {
      dataGroups: DataAttributeGroup[]
      dataAttributes: DataAttribute[],
      dataEnumTypes: DataEnumType[],
    }
  },
  dashboardConfig:{
    module?: DashboardModule,
    dashboardName: string,
    dashboardLink: string,
    height: string,
  }
}
export interface SystemConfigDocument extends SystemConfig, Document { }


export interface DataAttributeGroup {
  code: string;
  name: string;
  detailViewOrder: number;
}
export interface DataAttributeGroupDocument extends DataAttributeGroup, Document { }


export interface SimpleDataAttribute {
  code: string;
  name: string;
  shortName: string;
  groupCode: string;
  detailViewOrder: number;
  type: DataAttributeType;
}


export interface DataAttribute extends SimpleDataAttribute {
  dataProviderType?: DataAttributeProviderType;
  //when providertype dynamic, then it will be a simple Array<any>, if enum, it will be [{id: any, value: string}]
  data?: [{
    id: any;
    value: string;
  }] | Array<any>
}
export interface DataAttributeDocument extends DataAttribute, Document { }


export enum DataAttributeType {
  STRING = "string",
  STRING_MONTH_DAY = 'stringMonthDay',
  INTEGER = "integer",
  DATE = "date",
  DATE_TIME = "dateTime",
  NUMBER = "number",
  OBJECT_ID = "objectId",
}


export enum DataAttributeProviderType {
  NONE = "none",
  ENUM = "enum",
  DYNAMIC = "dynamic"
}

export interface DataEnumType {
  code : String,
  name : String,
  status: ModelStatus,
  enumStructure: [],
}
export interface DataEnumTypeDocument extends DataEnumType, Document { }