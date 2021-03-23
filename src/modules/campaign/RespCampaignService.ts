import DataDomain from '../../enums/DataDomain';
import Privilege from '../../enums/Privilege';
import ICrudService from '../../interfaces/services/ICrudService';
import IServiceBase from '../../interfaces/services/IServiceBase';
import RespSurveyService from '../survey/RespSurveyService';
import ASurveyCampaignService from './ASurveyCampaignService';


class RespCampaignService extends ASurveyCampaignService implements IServiceBase, ICrudService {

  constructor() {
    super(
      'modules.campaign.RespCampaignService',
      {
        createPrivileges: [Privilege.RESP_AI_EDIT],
        readPrivileges: [Privilege.RESP_AI_VIEW, Privilege.RESP_AI_EDIT],
        updatePrivileges: [Privilege.RESP_AI_EDIT],
        deletePrivileges: [Privilege.RESP_AI_EDIT]
      },
      DataDomain.RESP,
      new RespSurveyService()
    );
  }

}

export default RespCampaignService
