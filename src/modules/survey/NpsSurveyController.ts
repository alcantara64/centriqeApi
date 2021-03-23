import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import ASurveyController from './ASurveyController';
import NpsSurveyService from './NpsSurveyService';


class NpsSurveyController extends ASurveyController implements IControllerBase, ICrudController {

  constructor() {
    super(
      new NpsSurveyService(),
      'modules.survey.NpsSurveyController'
    );
  }

}


export default NpsSurveyController
