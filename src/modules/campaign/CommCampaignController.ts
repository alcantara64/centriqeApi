import DataDomain from '../../enums/DataDomain';
import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import ACampaignController from './ACampaignController';
import CommCampaignService from './CommCampaignService';


class CampaignController extends ACampaignController implements IControllerBase, ICrudController {

  constructor() {
    super(
      new CommCampaignService(),
      'modules.campaign.CommCampaignController',
      DataDomain.COMM
    );
  }

}


export default CampaignController
