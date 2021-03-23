import ACrudController from '../../interfaces/controllers/ACrudController';
import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import RoleService from './RoleService';



class RoleController extends ACrudController implements IControllerBase, ICrudController {

  constructor() {
    super(
      new RoleService(),
      'modules.customer.RoleController'
    );
  }

}
export default RoleController
