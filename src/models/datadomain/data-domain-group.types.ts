import { DataDomainCode, DataDomainMode } from './data-domain.types'


export interface DataDomainGroup {
  code: DataDomainGroupCode;
  name: string;
  dataDomains: DataDomainCode[];
  showInOrgConfig: boolean;
  mode: DataDomainMode;
}

export interface DataDomainGroupConfigItem {
  code: DataDomainGroupCode;
  holdingOrgLevel: boolean;
  memberOrgLevel: boolean
}


export enum DataDomainGroupCode {
  System = "System",
  AppModules = "AppModules",
  Customer = "Customer",
  Product = "Product",
  Revenue = "Revenue",
  Cost = "Cost"
}


export const dataDomainGroups: DataDomainGroup[] = [
  {
    code: DataDomainGroupCode.AppModules, name: "App Modules", dataDomains: [
      DataDomainCode.COMM, DataDomainCode.MARKET_PLACE, DataDomainCode.NPS, DataDomainCode.PROFIT_EDGE, DataDomainCode.RESP
    ], mode: DataDomainMode.MULTI, showInOrgConfig: true
  },
  { code: DataDomainGroupCode.System, name: "System", dataDomains: [DataDomainCode.SYSTEM], mode: DataDomainMode.SINGLE, showInOrgConfig: false },
  { code: DataDomainGroupCode.Customer, name: "Customer", dataDomains: [DataDomainCode.CUSTOMER], mode: DataDomainMode.SINGLE, showInOrgConfig: true },
  { code: DataDomainGroupCode.Product, name: "Product", dataDomains: [DataDomainCode.PRODUCT], mode: DataDomainMode.SINGLE, showInOrgConfig: true },
  { code: DataDomainGroupCode.Revenue, name: "Revenue", dataDomains: [DataDomainCode.REVENUE], mode: DataDomainMode.SINGLE, showInOrgConfig: true },
  { code: DataDomainGroupCode.Cost, name: "Cost", dataDomains: [DataDomainCode.COST], mode: DataDomainMode.MULTI, showInOrgConfig: true },
]
