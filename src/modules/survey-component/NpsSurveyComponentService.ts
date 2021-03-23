import DataDomain from '../../enums/DataDomain';
import Privilege from '../../enums/Privilege';
import ICrudService from '../../interfaces/services/ICrudService';
import IServiceBase from '../../interfaces/services/IServiceBase';
import ASurveyComponentService from './ASurveyComponentService';


class NpsSurveyComponentService extends ASurveyComponentService implements IServiceBase, ICrudService {

  constructor() {
    super(
      'modules.survey-component.NpsSurveyComponentService',
      {
        createPrivileges: [Privilege.NPS_EDIT],
        readPrivileges: [Privilege.NPS_VIEW, Privilege.NPS_EDIT],
        updatePrivileges: [Privilege.NPS_EDIT],
        deletePrivileges: [Privilege.NPS_EDIT]
      },
      DataDomain.NPS
    );
  }

  protected getFieldNamesForSearch() {
    return ['memberOrg', 'holdingOrg'];
  }
}

export default NpsSurveyComponentService
