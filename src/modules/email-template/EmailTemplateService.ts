import ACrudService from '../../interfaces/services/ACrudService';
import IServiceBase from '../../interfaces/services/IServiceBase';
import ICrudService from '../../interfaces/services/ICrudService';

import MessageTemplateModel from '../../models/message/message-template.model';
import Privilege from '../../enums/Privilege';
import DataDomain from '../../enums/DataDomain';

class EmailTemplateService extends ACrudService implements IServiceBase, ICrudService {

  constructor() {
    super(
      MessageTemplateModel, //switched to using the MessageTemplateModel
      'modules.email-template.EmailTemplateService',
      {
        createPrivileges: [Privilege.COMM_AI_EDIT],
        readPrivileges: [Privilege.COMM_AI_VIEW, Privilege.COMM_AI_EDIT],
        updatePrivileges: [Privilege.COMM_AI_EDIT],
        deletePrivileges: [Privilege.COMM_AI_EDIT]
      },
      DataDomain.COMM
    );
  }

  restrictModelByDataDomain(): boolean {
    return true;
  }

  protected getFieldNamesForSearch() {
    return ['memberOrg', 'holdingOrg'];
  }



}

export default EmailTemplateService
