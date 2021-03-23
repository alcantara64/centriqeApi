import ACrudController from '../../interfaces/controllers/ACrudController';
import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import ASurveyInstanceService from './ASurveyInstanceService';



abstract class ASurveyInstanceController extends ACrudController implements IControllerBase, ICrudController {

  constructor(surveyInstanceService: ASurveyInstanceService, loggerString: string) {
    super(
      surveyInstanceService,
      loggerString,
      //disable create later
      { create: true, delete: false, readMany: true, readOne: true, search: true, updateMany: false, updateOne: false }
    );
  }
}


export default ASurveyInstanceController
