import ACrudController from '../../interfaces/controllers/ACrudController';
import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import ASurveyService from './ASurveyService';



abstract class ASurveyController extends ACrudController implements IControllerBase, ICrudController {

  constructor(campaignService: ASurveyService, loggerString: string) {
    super(
      campaignService,
      loggerString
    );
  }

}


export default ASurveyController
