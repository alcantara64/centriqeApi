import ACrudController from '../../interfaces/controllers/ACrudController';
import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import RespTypeService from './RespTypeService';



class ResponseTypeController extends ACrudController implements IControllerBase, ICrudController {

  constructor() {
    super(
      new RespTypeService(),
      'modules.resp-type.RespTypeController'
    );
  }

}


export default ResponseTypeController
