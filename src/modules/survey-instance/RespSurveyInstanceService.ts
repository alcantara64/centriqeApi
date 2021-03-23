import DataDomain from '../../enums/DataDomain';
import Privilege from '../../enums/Privilege';
import ICrudService from '../../interfaces/services/ICrudService';
import IServiceBase from '../../interfaces/services/IServiceBase';
import ASurveyInstanceService from './ASurveyInstanceService';
import RespSurveyService from '../survey/RespSurveyService';


class RespSurveyInstanceService extends ASurveyInstanceService implements IServiceBase, ICrudService {
  constructor() {
    super(
      'modules.survey-instance.RespSurveyInstanceService',
      {
        createPrivileges: [Privilege.SYSTEM_ADMIN_EDIT],
        readPrivileges: [Privilege.SYSTEM_ADMIN_EDIT, Privilege.RESP_AI_EDIT, Privilege.RESP_AI_VIEW],
        updatePrivileges: [Privilege.SYSTEM_ADMIN_EDIT],
        deletePrivileges: [Privilege.SYSTEM_ADMIN_EDIT]
      },
      DataDomain.RESP,
      new RespSurveyService()
    );
  }


  protected getFieldNamesForSearch() {
    return ['memberOrg', 'holdingOrg'];
  }
}

export default RespSurveyInstanceService
