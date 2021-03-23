
export type Secureable = {
  holdingOrgs: Array<string>,
  memberOrgs: Array<string>
}
interface IRowLevelUserSecurity {
  isAdmin: boolean,

  customer: Secureable,
  product: Secureable,
  revenue: Secureable,
  cost: Secureable,
  communication: Secureable,
  response: Secureable,
  nps: Secureable,
  profitEdge: Secureable,
  marketPlace: Secureable
}

export default IRowLevelUserSecurity
