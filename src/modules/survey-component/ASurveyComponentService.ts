import DataDomain from '../../enums/DataDomain';
import ACrudService, { IGrantingPrivileges } from '../../interfaces/services/ACrudService';
import ICrudService from '../../interfaces/services/ICrudService';
import IServiceBase from '../../interfaces/services/IServiceBase';
import SurveyComponentModel from '../../models/resp/survey-component.model';


abstract class ASurveyComponentService extends ACrudService implements IServiceBase, ICrudService {

  constructor(loggerString: string, grantingPrivileges: IGrantingPrivileges, dataDomain: DataDomain) {
    super(
      SurveyComponentModel,
      loggerString,
      grantingPrivileges,
      dataDomain
    );
  }

  restrictModelByDataDomain(): boolean {
    return true;
  }

}

export default ASurveyComponentService
