
export enum DataDomainCode {
  NONE = "none",
  CUSTOMER = "customer",
  PRODUCT = "product",
  REVENUE = "revenue",
  COST = "cost",
  COMM = "communication",
  RESP = "response",
  NPS = "nps",
  PROFIT_EDGE = "profitEdge",
  MARKET_PLACE = "marketPlace",
  SYSTEM = "system",
}

enum DataDomainCodeOld {
  NONE = "none",
  CUSTOMER = "customer",
  PRODUCT = "product",
  REVENUE = "revenue",
  COST = "cost",
  COMM = "communication",
  RESP = "response",
  NPS = "nps",
  PROFIT_EDGE = "profitEdge",
  MARKET_PLACE = "marketPlace",
  SYSTEM = "system",
}

export enum DataDomainMode {
  SINGLE = "single",
  MULTI = "multi"
}



export const dataDomainToOldDataDomainCodeByMap = new Map<DataDomainCode, DataDomainCodeOld>()
dataDomainToOldDataDomainCodeByMap.set(DataDomainCode.COMM, DataDomainCodeOld.COMM);
dataDomainToOldDataDomainCodeByMap.set(DataDomainCode.COST, DataDomainCodeOld.COST);
dataDomainToOldDataDomainCodeByMap.set(DataDomainCode.CUSTOMER, DataDomainCodeOld.CUSTOMER);
dataDomainToOldDataDomainCodeByMap.set(DataDomainCode.MARKET_PLACE, DataDomainCodeOld.MARKET_PLACE);
dataDomainToOldDataDomainCodeByMap.set(DataDomainCode.NONE, DataDomainCodeOld.NONE);
dataDomainToOldDataDomainCodeByMap.set(DataDomainCode.NPS, DataDomainCodeOld.NPS);
dataDomainToOldDataDomainCodeByMap.set(DataDomainCode.PRODUCT, DataDomainCodeOld.PRODUCT);
dataDomainToOldDataDomainCodeByMap.set(DataDomainCode.PROFIT_EDGE, DataDomainCodeOld.PROFIT_EDGE);
dataDomainToOldDataDomainCodeByMap.set(DataDomainCode.RESP, DataDomainCodeOld.RESP);
dataDomainToOldDataDomainCodeByMap.set(DataDomainCode.REVENUE, DataDomainCodeOld.REVENUE);
dataDomainToOldDataDomainCodeByMap.set(DataDomainCode.SYSTEM, DataDomainCodeOld.SYSTEM);
