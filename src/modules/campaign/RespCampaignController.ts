import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import RespSurveyInstanceService from '../survey-instance/RespSurveyInstanceService';
import ASurveyCampaignController from './ASurveyCampaignController';
import RespCampaignService from './RespCampaignService';
import DataDomain from '../../enums/DataDomain';


class RespCampaignController extends ASurveyCampaignController implements IControllerBase, ICrudController {

  constructor() {
    super(
      new RespCampaignService(),
      'modules.campaign.RespCampaignController',
      new RespSurveyInstanceService(),
      DataDomain.RESP
    );
  }

}


export default RespCampaignController
