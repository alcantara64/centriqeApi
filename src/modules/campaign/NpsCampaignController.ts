import DataDomain from '../../enums/DataDomain';
import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import NpsSurveyInstanceService from '../survey-instance/NpsSurveyInstanceService';
import ASurveyCampaignController from './ASurveyCampaignController';
import NpsCampaignService from './NpsCampaignService';


class NpsCampaignController extends ASurveyCampaignController implements IControllerBase, ICrudController {

  constructor() {
    super(
      new NpsCampaignService(),
      'modules.campaign.NpsCampaignController',
      new NpsSurveyInstanceService(),
      DataDomain.NPS
    );
  }

}


export default NpsCampaignController
