import DataDomain from '../../enums/DataDomain';
import Privilege from '../../enums/Privilege';
import ICrudService from '../../interfaces/services/ICrudService';
import IServiceBase from '../../interfaces/services/IServiceBase';
import ACampaignService from './ACampaignService';


class CampaignService extends ACampaignService implements IServiceBase, ICrudService {

  constructor() {
    super(
      'modules.campaign.CommCampaignService',
      {
        createPrivileges: [Privilege.COMM_AI_EDIT],
        readPrivileges: [Privilege.COMM_AI_VIEW, Privilege.COMM_AI_EDIT],
        updatePrivileges: [Privilege.COMM_AI_EDIT],
        deletePrivileges: [Privilege.COMM_AI_EDIT]
      },
      DataDomain.COMM
    );
  }

  protected getFieldNamesForSearch() {
    return ['memberOrg', 'holdingOrg'];
  }
}

export default CampaignService
