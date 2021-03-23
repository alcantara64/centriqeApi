import DataDomain from '../../enums/DataDomain';
import Privilege from '../../enums/Privilege';
import ICrudService from '../../interfaces/services/ICrudService';
import IServiceBase from '../../interfaces/services/IServiceBase';
import ASurveyComponentService from './ASurveyComponentService';


class RespSurveyComponentService extends ASurveyComponentService implements IServiceBase, ICrudService {

  constructor() {
    super(
      'modules.survey-component.RespSurveyComponentService',
      {
        createPrivileges: [Privilege.RESP_AI_EDIT],
        readPrivileges: [Privilege.RESP_AI_VIEW, Privilege.RESP_AI_EDIT],
        updatePrivileges: [Privilege.RESP_AI_EDIT],
        deletePrivileges: [Privilege.RESP_AI_EDIT]
      },
      DataDomain.RESP
    );
  }




  protected getFieldNamesForSearch() {
    return ['memberOrg', 'holdingOrg'];
  }
}

export default RespSurveyComponentService
