import { Document, Model } from "mongoose";
import Privilege from "../../enums/Privilege";
import DataDomain from "../../enums/DataDomain";
import ModelStatus from "../../enums/ModelStatus";
import { PrivilegeCode } from "./privilege.types";


export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  title: string;
  status: ModelStatus;
  password?: string; //required in schema, but not always populated
  roles: string[];
  isAdmin: boolean;
  canUseGlobalOrgSelector: boolean;
  resetPasswordNextLogon: boolean;
  resetPasswordCode: string;
  resetPasswordToken: string;
  resetPasswordExpires: number;
  rowLevelSecurityFromUi: [UserRowLevelSecurityUi]
  rowLevelSecurity: any;
  privileges?: Privilege[];

  userTypeCode: UserTypeCode;
  orgTags: string[];
  orgAccessList: OrgAccessItem[];
}


export interface UserDocument extends User, Document {
  generateAuthToken: (this: UserDocument) => void;
  getHoldingOrgsForGlobalSelector: (this: UserDocument) => string[];
}

export interface UserModel extends Model<UserDocument> { }

export interface UserRowLevelSecurityUi {
  dataDomain: DataDomain;
  holHoldingOrg: string;
  molHoldingOrg: string;
  molMemberOrgs: string;
}
export interface UserRowLevelSecurityUiDocument extends UserRowLevelSecurityUi, Document { }
export interface UserRowLevelSecurityUiModel extends Model<UserRowLevelSecurityUiDocument> { }



export enum UserTypeCode {
  SystemAdmin = "SystemAdmin",
  CentriqeAdmin = "CentriqeAdmin",
  CentriqeUser = "CentriqeUser",
  ClientAdmin = "ClientAdmin",
  ClientUser = "ClientUser",
}

export interface OrgAccessItem {
  holdingOrgAccessDetail: HoldingOrgAccessDetail;
  memberOrgAccessDetails: MemberOrgAccessDetail[];
}

export interface OrgAccessDetail {
  privilegeCodes: PrivilegeCode[];
}
export interface HoldingOrgAccessDetail extends OrgAccessDetail {
  holdingOrgId: string;
}
export interface MemberOrgAccessDetail extends OrgAccessDetail {
  memberOrgId: string;
}
