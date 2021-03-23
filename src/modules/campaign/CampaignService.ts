import DataDomain from '../../enums/DataDomain';
import Privilege from '../../enums/Privilege';
import ICrudService from '../../interfaces/services/ICrudService';
import IServiceBase from '../../interfaces/services/IServiceBase';
import ACampaignService from './ACampaignService';


class CampaignService extends ACampaignService implements IServiceBase, ICrudService {

  constructor() {
    super(
      'modules.campaign.CampaignService',
      {
        createPrivileges: [Privilege.SYSTEM_ADMIN_EDIT],
        readPrivileges: [Privilege.SYSTEM_ADMIN_EDIT],
        updatePrivileges: [],
        deletePrivileges: []
      },
      DataDomain.NONE
    );
  }


  protected getFieldNamesForSearch() {
    return ['memberOrg', 'holdingOrg'];
  }
}

export default CampaignService
