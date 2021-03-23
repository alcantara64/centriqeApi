import ACrudController from '../../interfaces/controllers/ACrudController';
import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import ASurveyComponentService from './ASurveyComponentService';



abstract class ASurveyComponentController extends ACrudController implements IControllerBase, ICrudController {

  constructor(campaignService: ASurveyComponentService, loggerString: string) {
    super(
      campaignService,
      loggerString
    );
  }

}


export default ASurveyComponentController
