import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import ASurveyComponentController from './ASurveyComponentController';
import RespSurveyComponentService from './RespSurveyComponentService';


class RespSurveyComponentController extends ASurveyComponentController implements IControllerBase, ICrudController {

  constructor() {
    super(
      new RespSurveyComponentService(),
      'modules.survey-component.RespSurveyComponentController'
    );
  }

}


export default RespSurveyComponentController
