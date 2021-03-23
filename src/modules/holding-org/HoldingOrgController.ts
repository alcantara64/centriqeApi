import ACrudController from '../../interfaces/controllers/ACrudController';
import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import HoldingOrgService from './HoldingOrgService';



class HoldingOrgController extends ACrudController implements IControllerBase, ICrudController {

  constructor() {
    super(
      new HoldingOrgService(),
      'modules.customer.HoldingOrgController'
    );
  }
}


export default HoldingOrgController
