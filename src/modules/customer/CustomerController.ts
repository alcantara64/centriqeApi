import ACrudController from '../../interfaces/controllers/ACrudController';
import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import CustomerService from './CustomerService';



class CustomerController extends ACrudController implements IControllerBase, ICrudController {

  constructor() {
    super(
      new CustomerService(),
      'modules.customer.CustomerController'
    );
  }

}


export default CustomerController
