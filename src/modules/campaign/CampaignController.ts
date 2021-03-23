import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import ACampaignController from './ACampaignController';
import CampaignService from './CampaignService';
import DataDomain from '../../enums/DataDomain';


class CampaignController extends ACampaignController implements IControllerBase, ICrudController {

  constructor() {
    super(
      new CampaignService(),
      'modules.campaign.ACampaignController',
      DataDomain.NONE
    );
  }

}


export default CampaignController
