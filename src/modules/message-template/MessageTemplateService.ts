import ACrudService from '../../interfaces/services/ACrudService';
import IServiceBase from '../../interfaces/services/IServiceBase';
import ICrudService from '../../interfaces/services/ICrudService';

import MessageTemplateModel from '../../models/message/message-template.model';
import Privilege from '../../enums/Privilege';
import DataDomain from '../../enums/DataDomain';

class MessageTemplateService extends ACrudService implements IServiceBase, ICrudService {

  constructor() {
    super(
      MessageTemplateModel,
      'modules.message-template.MessageTemplateService',
      {
        createPrivileges: [Privilege.COMM_AI_EDIT],
        readPrivileges: [Privilege.COMM_AI_VIEW, Privilege.COMM_AI_EDIT],
        updatePrivileges: [Privilege.COMM_AI_EDIT],
        deletePrivileges: [Privilege.COMM_AI_EDIT]
      },
      DataDomain.COMM
    );
  }
}

export default MessageTemplateService
