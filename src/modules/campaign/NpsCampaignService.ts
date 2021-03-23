import DataDomain from '../../enums/DataDomain';
import Privilege from '../../enums/Privilege';
import ICrudService from '../../interfaces/services/ICrudService';
import IServiceBase from '../../interfaces/services/IServiceBase';
import NpsSurveyService from '../survey/NpsSurveyService';
import ASurveyCampaignService from './ASurveyCampaignService';


class NpsCampaignService extends ASurveyCampaignService implements IServiceBase, ICrudService {

  constructor() {
    super(
      'modules.campaign.NpsCampaignService',
      {
        createPrivileges: [Privilege.NPS_EDIT],
        readPrivileges: [Privilege.NPS_VIEW, Privilege.NPS_EDIT],
        updatePrivileges: [Privilege.NPS_EDIT],
        deletePrivileges: [Privilege.NPS_EDIT]
      },
      DataDomain.NPS,
      new NpsSurveyService()
    );
  }
}

export default NpsCampaignService
