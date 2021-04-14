
import { Document } from "mongoose";
import { DataDomainGroupConfigItem } from "../datadomain/data-domain-group.types";
import { DataAttribute } from "../system/system-config.types";
import { Org } from "./org.types";
export interface HoldingOrg extends Org {

  dataDomainConfig: {
    customer: DataDomainSchema;
    product: DataDomainSchema;
    revenue: DataDomainSchema;
    cost: DataDomainSchema;
    communication: DataDomainSchema;
    response: DataDomainSchema;
    nps: DataDomainSchema;
    profitEdge: DataDomainSchema;
    marketPlace: DataDomainSchema;
  },
  dataDomainGroupConfig: DataDomainGroupConfigItem[],
  orgTags: string[];

  logoUrl?: string;
  bussinessVertical: BusinessVertical;

  dataConfig: {
    customer: {
      dataAttributes: HoldingOrgDataAttributeConfig[]
    },
  }
}
export interface HoldingOrgDocument extends HoldingOrg, Document { }


export interface DataDomainSchema {
  holdingOrgLevel: boolean;
  memberOrgLevel: boolean;
}

export enum BusinessVertical {
  HOSPITALITY = "Hospitality",
  RETAIL = "Retail",
  BANKING = "Banking",
  FINANCIAL = "Financial",
  MANUFACTURING = "Manufacturing",
  SERVICE_INDUSTRY = "Service Industry",
  HEALTHCARE = "Healthcare",
  RESTAURANT = "Restaurant"
}


export interface HoldingOrgDataAttributeConfig extends DataAttribute {
  loadAttributeName?: string;
  useInTableView: boolean;
  useInDetailView: boolean;
  useInCampaignFilter: boolean;
  tableViewOrder?: number;
}
export interface HoldingOrgDataAttributeConfigDocument extends HoldingOrgDataAttributeConfig, Document { }
