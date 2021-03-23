import ACrudController from '../../interfaces/controllers/ACrudController';
import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import EmailTemplateService from './EmailTemplateService';



class EmailTemplateController extends ACrudController implements IControllerBase, ICrudController {

  constructor() {
    super(
      new EmailTemplateService(),
      'modules.email-template.EmailTemplateController'
    );
  }

}


export default EmailTemplateController
