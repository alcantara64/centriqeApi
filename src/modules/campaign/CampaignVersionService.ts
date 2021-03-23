import { CampaignDocument } from 'src/models/campaign/campaign.types';
import DataDomain from '../../enums/DataDomain';
import Privilege from '../../enums/Privilege';
import AppUser from '../../interfaces/models/AppUser';
import IRoleBasedUserSecurity from '../../interfaces/models/IRoleBasedUserSecurity';
import ACrudService from '../../interfaces/services/ACrudService';
import ICrudService from '../../interfaces/services/ICrudService';
import IServiceBase from '../../interfaces/services/IServiceBase';
import CampaignVersionModel from '../../models/campaign/campaign-version.model';
import CampaignService from './CommCampaignService';

/**
 * Disabled all security. This should only be used internally by ACampaignController
 */
class CampaignVersionService extends ACrudService implements IServiceBase, ICrudService {
  private campaignService: CampaignService

  constructor() {
    super(
      CampaignVersionModel,
      'modules.campaign.CustomerVersionService',
      {
        createPrivileges: [],
        readPrivileges: [],
        updatePrivileges: [],
        deletePrivileges: []
      },
      DataDomain.NONE
    );
    this.campaignService = new CampaignService();
  }


  protected isRoleBasedAccessAllowed(roleSecurity: IRoleBasedUserSecurity, grantingPrivileges: Array<Privilege>): void {
    //empty implementation > no role check (normally throws exception)
  }

  protected isRowLevelSecurityEnabled(methodName: string): boolean {
    //disable row level security
    return false;
  }

  public async readManyVersionsByParentId(appUser: AppUser, campaignId: string, queryOpts: any = {}): Promise<any> {
    //checks if access is allowed; well, and we need the code, etc.
    const campaign = <CampaignDocument>await this.campaignService.readOneById(appUser, campaignId);
    queryOpts.code = campaign.code
    queryOpts.holdingOrg = campaign.holdingOrg
    queryOpts.memberOrg = campaign.memberOrg
    queryOpts.dataDomain = campaign.dataDomain
    queryOpts.disableWildcardFor = { code: 1 }
    return await this.readMany(appUser, queryOpts)
  }

}

export default CampaignVersionService
