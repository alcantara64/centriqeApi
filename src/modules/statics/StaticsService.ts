import AppException from '../../exceptions/AppException';
import AReadService from '../../interfaces/services/AReadService';
import AppUser from '../../interfaces/models/AppUser';
import ICrudService from '../../interfaces/services/ICrudService';
import IServiceBase from '../../interfaces/services/IServiceBase';
import DataDomainConfig from '../../enums/DataDomainConfig';
import config from '../../lib/config';

class StaticsService extends AReadService implements IServiceBase, ICrudService {

  constructor() {
    super(
      'modules.statics.StaticsService'
    );
  }

  public async readOneById(appUser: AppUser, id: string): Promise<any> {
    throw new AppException("Method not supported");
  }

  public async readMany(appUser: AppUser, opts: any): Promise<any> {

    return {
      dataDomains: DataDomainConfig.getAsObject(),
      messaging: {
        email: {
          defaultSender: config.messaging.email.defaultSender
        },
        sms: {
          defaultSender: config.messaging.sms.defaultSender
        },
        whatsApp: {
          defaultSender: config.messaging.whatsApp.defaultSender
        }
      }
    }

  }
}

export default StaticsService;
