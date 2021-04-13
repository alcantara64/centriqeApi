import { Document } from "mongoose";
import ModelStatus from "../../enums/ModelStatus";


export interface Org {
  code: string;
  name: string;
  addressLine1?: string;
  addressLine2?: string;
  zipCode?: string;
  city?: string;
  state?: string;
  phone?: string;
  country?: string;
  fax?: string;
  tollFreeNumber?: string;
  email?: string;
  websiteAddress?: string;
  subscribedModuleCodes: string[];

  defaultEmailSender?: string;
  defaultWhatsAppSender?: string;
  defaultSmsSender?: string;

  dashboardConfig: DashboardConfigItem[];

  status: ModelStatus;
}

export interface OrgDocument extends Org, Document { }


export interface DashboardConfigItem {
  module: DashboardModule;
  dashboardName?: string;
  dashboardLink?: string;
  height?: string;
  maxWidth?: string;
  minWidth?: string;
}


export enum DashboardModule {
  HOME = "home",
  ASK_BUDDY = "askBuddy",
  COMM = "comm",
  RESP = "resp",
  NPS = "nps",
  INSIGHT = "insight",
  PROFIT_EDGE = "profitEdge"
}


export enum AppModule {
  AskBuddy = "AskBuddy",
  Comm = "Comm",
  Resp = "Resp",
  NPS = "NPS",
  MarketPlace = "MarketPlace",
  Insight = "Insight",
  ProfitEdge = "ProfitEdge"
}
