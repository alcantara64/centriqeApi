import IControllerBase from '../../interfaces/controllers/IControllerBase';
import AFileUploadController from './AFileUploadController';
import CustomerFileUploadService from './CustomerFileUploadService';



class CustomerFileUploadController extends AFileUploadController implements IControllerBase {

  constructor() {
    super(
      new CustomerFileUploadService(),
      'modules.customer.CustomerController'
    );
  }

}


export default CustomerFileUploadController
