import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import ASurveyComponentController from './ASurveyComponentController';
import NpsSurveyComponentService from './NpsSurveyComponentService';


class NpsSurveyComponentController extends ASurveyComponentController implements IControllerBase, ICrudController {

  constructor() {
    super(
      new NpsSurveyComponentService(),
      'modules.survey-component.NpsSurveyComponentController'
    );
  }

}


export default NpsSurveyComponentController
