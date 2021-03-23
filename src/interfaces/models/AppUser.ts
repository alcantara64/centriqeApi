import Privilege from "src/enums/Privilege";
import IRoleBasedUserSecurity from "./IRoleBasedUserSecurity";
import IRowLevelUserSecurity, { Secureable } from "./IRowLevelUserSecurity";

class AppUser implements IRowLevelUserSecurity, IRoleBasedUserSecurity {

  constructor(
    public id: string,
    public userId: string,
    public userName: string,
    public email: string,
    public isAdmin: boolean,
    public privileges: Array<Privilege>,

    public customer: Secureable,
    public product: Secureable,
    public revenue: Secureable,
    public cost: Secureable,
    public communication: Secureable,
    public response: Secureable,
    public nps: Secureable,
    public profitEdge: Secureable,
    public marketPlace: Secureable

    ) {

  }


}

export default AppUser
