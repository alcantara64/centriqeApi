import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import ASurveyInstanceController from './ASurveyInstanceController';
import NpsSurveyInstanceService from './NpsSurveyInstanceService';


class NpsSurveyInstanceController extends ASurveyInstanceController implements IControllerBase, ICrudController {

  constructor() {
    super(
      new NpsSurveyInstanceService(),
      'modules.survey-instance.NpsSurveyInstanceController'
    );
  }

}


export default NpsSurveyInstanceController
