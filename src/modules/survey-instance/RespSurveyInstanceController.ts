import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import ASurveyInstanceController from './ASurveyInstanceController';
import RespSurveyInstanceService from './RespSurveyInstanceService';


class RespSurveyInstanceController extends ASurveyInstanceController implements IControllerBase, ICrudController {

  constructor() {
    super(
      new RespSurveyInstanceService(),
      'modules.survey-instance.RespSurveyInstanceController'
    );
  }

}


export default RespSurveyInstanceController
