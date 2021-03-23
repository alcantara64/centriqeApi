import ACrudService from '../../interfaces/services/ACrudService';
import IServiceBase from '../../interfaces/services/IServiceBase';
import ICrudService from '../../interfaces/services/ICrudService';

import RespTypeModel from '../../models/resp/resp-type.model';
import Privilege from '../../enums/Privilege';
import DataDomain from '../../enums/DataDomain';

class RespTypeService extends ACrudService implements IServiceBase, ICrudService {

  constructor() {
    super(
      RespTypeModel,
      'modules.resp-type.RespTypeService',
      {
        createPrivileges: [Privilege.RESP_AI_EDIT],
        readPrivileges: [Privilege.RESP_AI_VIEW, Privilege.RESP_AI_EDIT],
        updatePrivileges: [Privilege.RESP_AI_EDIT],
        deletePrivileges: [Privilege.RESP_AI_EDIT]
      },
      DataDomain.NONE
    );
  }

  protected isRowLevelSecurityEnabled(methodName: string): boolean {
    //no row-level security right now. If you have access to manipulate users, there is no further restriction.
    return false;
  }

}

export default RespTypeService
