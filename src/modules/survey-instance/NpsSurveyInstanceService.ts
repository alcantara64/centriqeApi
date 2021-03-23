import DataDomain from '../../enums/DataDomain';
import Privilege from '../../enums/Privilege';
import ICrudService from '../../interfaces/services/ICrudService';
import IServiceBase from '../../interfaces/services/IServiceBase';
import NpsSurveyService from '../survey/NpsSurveyService';
import ASurveyInstanceService from './ASurveyInstanceService';


class NpsSurveyInstanceService extends ASurveyInstanceService implements IServiceBase, ICrudService {

  constructor() {
    super(
      'modules.survey-instance.NpsSurveyInstanceService',
      {
        createPrivileges: [Privilege.SYSTEM_ADMIN_EDIT],
        readPrivileges: [Privilege.SYSTEM_ADMIN_EDIT, Privilege.NPS_EDIT, Privilege.NPS_VIEW],
        updatePrivileges: [Privilege.SYSTEM_ADMIN_EDIT],
        deletePrivileges: [Privilege.SYSTEM_ADMIN_EDIT]
      },
      DataDomain.NPS,
      new NpsSurveyService()
    );
  }

  protected getFieldNamesForSearch() {
    return ['memberOrg', 'holdingOrg'];
  }
}

export default NpsSurveyInstanceService
