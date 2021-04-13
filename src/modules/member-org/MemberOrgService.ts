import _ from 'lodash';
import mongoose from 'mongoose';
import DataDomain from '../../enums/DataDomain';
import ModelStatus from '../../enums/ModelStatus';
import Privilege from '../../enums/Privilege';
import ACrudService from '../../interfaces/services/ACrudService';
import ICrudService from '../../interfaces/services/ICrudService';
import IServiceBase from '../../interfaces/services/IServiceBase';
import logger from '../../lib/logger';
import HoldingOrgService from '../holding-org/HoldingOrgService';
import MemberOrgModel from '../../models/org/member-org.model';
import { Model } from 'mongoose';
import AppUser from 'src/interfaces/models/AppUser';
import { MemberOrgDocument } from 'src/models/org/member-org.types';
import { AppModule } from 'src/models/org/org.types';



export type LeanDataDomain = {
  holdingOrgLevel: boolean,
  memberOrgLevel: boolean
}

export type LeanMemberOrg = {
  _id: string,
  code: string,
  name: string
}
export type LeanHoldingOrg = {
  _id: string,
  code: string,
  name: string,
  dataDomainConfig: {
    //attribute name changes/ adjustments also need to be reflected in enum DataDomain.ts
    customer: LeanDataDomain,
    product: LeanDataDomain,
    revenue: LeanDataDomain,
    cost: LeanDataDomain,
    communication: LeanDataDomain,
    response: LeanDataDomain,
    nps: LeanDataDomain,
    profitEdge: LeanDataDomain,
    marketPlace: LeanDataDomain
  },
  memberOrgs: Array<LeanMemberOrg>
}

class MemberOrgService extends ACrudService implements IServiceBase, ICrudService {

  constructor() {
    super(
      MemberOrgModel,
      'modules.customer.MemberOrgService',
      {
        createPrivileges: [Privilege.CLIENT_SETUP_EDIT],
        readPrivileges: [Privilege.CLIENT_SETUP_VIEW, Privilege.CLIENT_SETUP_EDIT],
        updatePrivileges: [Privilege.CLIENT_SETUP_EDIT],
        deletePrivileges: [Privilege.CLIENT_SETUP_EDIT]
      },
      DataDomain.NONE
    );
  }


  /**
   * Overwrite
   */
  protected isRowLevelSecurityEnabled(methodName: string): boolean {
    //TODO needs to be secured on holdingOrg and memberOrg. Difference to other models is that "memberOrg" attribute is _id here.
    return false;
  }



  /**
   * No security check. Supposed to be used only internally for authentication routes!
   * @param id Find role by database id.
   */
  public async findMemberOrgById(id: string): Promise<any> {
    return await MemberOrgModel.findById(id);
  }

  /**
   * No security applied.
   * @param holdingOrgId
   */
  public async findMemberOrgsByHoldingOrgId(holdingOrgId: string) {
    logger.debug(`${this.loggerString}:findMemberOrgsByHoldingOrgId::Start ${holdingOrgId}`);
    return await MemberOrgModel.find({ holdingOrg: holdingOrgId }).populate('holdingOrg', 'name code');
  }

  public async updateMemberOrgSubscriptionsByHoldingOrgId(holdingOrgId: string, subscriptionCodes: AppModule[]): Promise<void> {
    logger.debug(`${this.loggerString}:updateMemberOrgSubscriptionsByHoldingOrgId::Start ${holdingOrgId}`);

    const memberOrgs = await MemberOrgModel.find({
      holdingOrg: new mongoose.Types.ObjectId(holdingOrgId),
      inheritSubscribedModules: true
    } as any);

    for (let memberOrg of memberOrgs) {
      memberOrg.subscribedModuleCodes = subscriptionCodes
      await memberOrg.save();
    }
  }

  public async findFirstActiveMemberOrgForUserByHoldingOrgId(appUser: AppUser, holdingOrgId: string): Promise<MemberOrgDocument | null> {
    logger.debug(`${this.loggerString}:findActiveMemberOrgForUserByHoldingOrgId::Start ${holdingOrgId}`);
    const memberOrg = await MemberOrgModel.findOne(
      {
        holdingOrg: holdingOrgId,
        status: ModelStatus.ACTIVE,
        _id: { $in: appUser.communication.memberOrgs }
      }
    ).sort({ name: 1, code: 1 })


    return memberOrg;
  }


  /**
   * No security applied.
   * @param holdingOrgId
   */
  public async findMemberOrgsByHoldingOrgIdsLean(holdingOrgIds: Array<string>) {
    logger.debug(`${this.loggerString}:findMemberOrgsByHoldingOrgIdsLean::Start ${holdingOrgIds}`);
    const results = await (<Model<any>>MemberOrgModel).find({ holdingOrg: holdingOrgIds }).lean();
    return results;
  }


  /**
   * Returns holdingOrg with associated memberOrgs. If there are no memberOrgs, it will only return the holdingOrg.
   * NO security -- only use internally for auth.
   */
  public async findActiveHoldingOrgWithMemberOrgsLean(holdingOrgId: string): Promise<LeanHoldingOrg | null> {
    logger.debug(`${this.loggerString}:findActiveHoldingOrgWithMemberOrgs::Start ${holdingOrgId}`);


    //get all active member orgs for the given holdingOrg
    const query = { holdingOrg: holdingOrgId, status: ModelStatus.ACTIVE };
    const memberOrgs = await MemberOrgModel.find(query).populate("holdingOrg").lean();

    let holdingOrg: LeanHoldingOrg | null = null

    if (memberOrgs.length > 0) {
      let memberOrg: any = memberOrgs[0]
      holdingOrg = {
        _id: memberOrg.holdingOrg._id.toString(),
        code: memberOrg.holdingOrg.code,
        name: memberOrg.holdingOrg.name,
        memberOrgs: [],
        dataDomainConfig: memberOrg.holdingOrg.dataDomainConfig
      }

      for (memberOrg of memberOrgs) {
        holdingOrg.memberOrgs.push({
          _id: memberOrg._id.toString(),
          code: memberOrg.code,
          name: memberOrg.name,
        });
      }
    } else {
      const holdingOrgService = new HoldingOrgService();
      const holdingOrgMongo = await holdingOrgService.findActiveHoldingOrgByIdLean(holdingOrgId);

      if (holdingOrgMongo) {
        holdingOrg = {
          _id: holdingOrgMongo._id.toString(),
          code: holdingOrgMongo.code,
          name: holdingOrgMongo.name,
          memberOrgs: [],
          dataDomainConfig: holdingOrgMongo.dataDomainConfig
        }
      }
    }

    return holdingOrg;
  }

  /**
* Get the DashBoard config for provided holdingOrg
* @param memebrOrg
*/
  public async findMemberOrgsDashboardConfig(memberOrg: string) {
    logger.debug(`${this.loggerString}:findMemberOrgsDashboardConfig::Start`);

    let query: any = {
      status: ModelStatus.ACTIVE
    }

    query = {
      $and: [
        query,
        { _id: memberOrg }
      ]
    }

    const memberOrgDashboardConfig: any = await this.model.findOne(query, { _id: 0, dashboardConfig: 1 }).lean();

    return { memberOrgDashboardConfig };
  }


}

export default MemberOrgService
