import ACrudController from '../../interfaces/controllers/ACrudController';
import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import MessageTemplateService from './MessageTemplateService';



class MessageTemplateController extends ACrudController implements IControllerBase, ICrudController {

  constructor() {
    super(
      new MessageTemplateService(),
      'modules.message-template.MessageTemplateController'
    );
  }

}


export default MessageTemplateController
