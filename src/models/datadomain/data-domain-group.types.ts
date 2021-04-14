import { DataDomainCode, DataDomainMode } from './data-domain.types'


export interface DataDomainGroup {
  code: DataDomainGroupCode;
  name: string;
  dataDomainCodes: DataDomainCode[];
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
    code: DataDomainGroupCode.AppModules, name: "App Modules", dataDomainCodes: [
      DataDomainCode.COMM, DataDomainCode.MARKET_PLACE, DataDomainCode.NPS, DataDomainCode.PROFIT_EDGE, DataDomainCode.RESP
    ], mode: DataDomainMode.MULTI, showInOrgConfig: true
  },
  { code: DataDomainGroupCode.System, name: "System", dataDomainCodes: [DataDomainCode.SYSTEM], mode: DataDomainMode.SINGLE, showInOrgConfig: false },
  { code: DataDomainGroupCode.Customer, name: "Customer", dataDomainCodes: [DataDomainCode.CUSTOMER], mode: DataDomainMode.SINGLE, showInOrgConfig: true },
  { code: DataDomainGroupCode.Product, name: "Product", dataDomainCodes: [DataDomainCode.PRODUCT], mode: DataDomainMode.SINGLE, showInOrgConfig: true },
  { code: DataDomainGroupCode.Revenue, name: "Revenue", dataDomainCodes: [DataDomainCode.REVENUE], mode: DataDomainMode.SINGLE, showInOrgConfig: true },
  { code: DataDomainGroupCode.Cost, name: "Cost", dataDomainCodes: [DataDomainCode.COST], mode: DataDomainMode.MULTI, showInOrgConfig: true },
];

export const dataDomainGroupMapByCode = new Map<DataDomainGroupCode, DataDomainGroup>()
for(let dataDomainGroup of dataDomainGroups) {
  dataDomainGroupMapByCode.set(dataDomainGroup.code, dataDomainGroup);
}

