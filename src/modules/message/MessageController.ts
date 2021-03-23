import ACrudController from '../../interfaces/controllers/ACrudController';
import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import MessageService from './MessageService';


class MessageController extends ACrudController implements IControllerBase, ICrudController {

  constructor() {
    super(
      new MessageService(),
      'modules.message.MessageController'
    );
  }
}


export default MessageController
