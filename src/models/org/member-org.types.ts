
import { Document } from "mongoose";
import { HoldingOrg } from "./holding-org.types";
import { Org } from "./org.types";

export interface MemberOrg extends Org {
  holdingOrg: string | HoldingOrg
}
export interface MemberOrgDocument extends MemberOrg, Document { }
