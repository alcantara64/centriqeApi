import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import ASurveyController from './ASurveyController';
import RespSurveyService from './RespSurveyService';


class RespSurveyController extends ASurveyController implements IControllerBase, ICrudController {

  constructor() {
    super(
      new RespSurveyService(),
      'modules.survey.RespSurveyController'
    );
  }

}


export default RespSurveyController
