import Privilege from '../../enums/Privilege';
import ACrudService from '../../interfaces/services/ACrudService';
import ICrudService from '../../interfaces/services/ICrudService';
import IServiceBase from '../../interfaces/services/IServiceBase';
import RoleModel from '../../models/user/role.model';
import DataDomain from '../../enums/DataDomain';


class RoleService extends ACrudService implements IServiceBase, ICrudService {

  constructor() {
    super(
      RoleModel,
      'modules.customer.RoleService',
      {
        createPrivileges: [Privilege.USER_ADMIN_EDIT],
        readPrivileges: [Privilege.USER_ADMIN_VIEW, Privilege.USER_ADMIN_EDIT],
        updatePrivileges: [Privilege.USER_ADMIN_EDIT],
        deletePrivileges: [Privilege.USER_ADMIN_EDIT]
      },
      DataDomain.NONE
    );
  }


  /**
   * Overwrite
   */
  protected isRowLevelSecurityEnabled(methodName: string): boolean {
    //no row-level security right now. If you have access to manipulate roles, there is no further restriction.
    return false;
  }


  /**
   * No security check. Supposed to be used only internally for authentication routes!
   * @param id Find role by database id.
   */
  public async findRoleById(id: string): Promise<any> {
    return await RoleModel.findById(id);
  }


}

export default RoleService
