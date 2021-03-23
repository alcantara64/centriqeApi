import { Document, Model } from "mongoose";
import Privilege from "src/enums/Privilege";
import DataDomain from "../../enums/DataDomain";
import ModelStatus from "../../enums/ModelStatus";


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
