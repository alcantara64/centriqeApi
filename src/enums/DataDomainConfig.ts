import DataDomainMode from './DataDomainMode'
import DataDomain from './DataDomain'

class DataDomainConfig {

  public static CUSTOMER = {
    attributeName: DataDomain.CUSTOMER,
    name: "Customer",
    businessName: "Customer",
    mode: DataDomainMode.SINGLE,
    canUnsubscribe: false,
    holdingOrgConfig: true,
  };

  public static PRODUCT = {
    attributeName: DataDomain.PRODUCT,
    name: "Product",
    businessName: "Product",
    mode: DataDomainMode.SINGLE,
    canUnsubscribe: false,
    holdingOrgConfig: true,
  };

  public static REVENUE = {
    attributeName: DataDomain.REVENUE,
    name: "Revenue",
    businessName: "Revenue",
    mode: DataDomainMode.SINGLE,
    canUnsubscribe: false,
    holdingOrgConfig: true,
  };

  public static COST = {
    attributeName: DataDomain.COST,
    name: "Cost",
    businessName: "Cost",
    mode: DataDomainMode.MULTI,
    canUnsubscribe: false,
    holdingOrgConfig: true,
  };

  public static COMM = {
    attributeName: DataDomain.COMM,
    name: "Communication",
    businessName: "Email Templates & Campaigns",
    mode: DataDomainMode.MULTI,
    canUnsubscribe: true,
    unsubscribeName: "Communication Campaigns",
    holdingOrgConfig: true,
  };

  public static RESP = {
    attributeName: DataDomain.RESP,
    name: "Response",
    businessName: "Feedback Templates & Campaigns",
    mode: DataDomainMode.MULTI,
    canUnsubscribe: true,
    unsubscribeName: "Surveys",
    holdingOrgConfig: true,
  };

  public static NPS = {
    attributeName: DataDomain.NPS,
    name: "NPS",
    businessName: "NPS Templates & Campaigns",
    mode: DataDomainMode.MULTI,
    canUnsubscribe: true,
    unsubscribeName: "NPS Surveys",
    holdingOrgConfig: true,
  };

  public static PROFIT_EDGE = {
    attributeName: DataDomain.PROFIT_EDGE,
    name: "Profit Edge",
    businessName: "Profit Edge",
    mode: DataDomainMode.MULTI,
    canUnsubscribe: false,
    holdingOrgConfig: true,
  };


  public static MARKET_PLACE = {
    attributeName: DataDomain.MARKET_PLACE,
    name: "Market Place",
    businessName: "Market Place",
    mode: DataDomainMode.MULTI,
    canUnsubscribe: false,
    holdingOrgConfig: true,
  };

  public static SYSTEM = {
    attributeName: DataDomain.SYSTEM,
    name: "System",
    businessName: "System",
    canUnsubscribe: false,
    holdingOrgConfig: false
  };



  /**
   * Converts static attributes to an object where attributeName is the key.
   * This only includes domains that have a "mode". System, for example, is excluded.
   */
  public static getAsObject() {
    const obj: any = {};

    Object.keys(DataDomainConfig).map((k) => {
      const value = (<any>DataDomainConfig)[k];

      if (value.attributeName && value.mode) {
        obj[value.attributeName] = {
          name: value.name,
          businessName: value.businessName,
          mode: value.mode
        }
      }

    });

    return obj;
  }


  /**
   * Converts static attributes to an array where attributeName is the content for each element
   * @deprecated Start using mongoose.util > stringEnumToArray(DataDomain) instead
   */
  public static getAsEnumArray(): Array<string> {
    const list: Array<string> = [];

    Object.keys(DataDomainConfig).map((k) => {
      const value = (<any>DataDomainConfig)[k];

      if (value.attributeName) {
        list.push(value.attributeName)
      }

    });

    return list;
  }


  /**
   * Converts static attributes to an array where attributeName is the content for each element.
   * This is necessary because not all data domains are used for holdingOrg or security configuration (e.g. SYSTEM or NONE)
   */
  public static getAsEnumArrayForHoldingOrgConfiguration(): Array<string> {
    const list: Array<string> = [];

    Object.keys(DataDomainConfig).map((k) => {
      const value = (<any>DataDomainConfig)[k];

      if (value.attributeName && value.holdingOrgConfig) {
        list.push(value.attributeName)
      }

    });

    return list;
  }


  /**
   * Converts static attributes to an array where canUnsubscribe = true
   */
  public static getUnsubscribeAsArray(): Array<UnsubscribeDataDomain> {
    const list: Array<UnsubscribeDataDomain> = [];

    Object.keys(DataDomainConfig).map((k) => {
      const value = (<any>DataDomainConfig)[k];

      if (value.attributeName && value.canUnsubscribe) {
        list.push({
          dataDomain: value.attributeName,
          unsubscribeName: value.unsubscribeName
        })
      }

    });

    return list;
  }



}

export default DataDomainConfig;

export type UnsubscribeDataDomain = {
  dataDomain: string;
  unsubscribeName: string;
}
