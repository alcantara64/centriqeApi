import { DashboardModule, OrgDocument } from '../../models/org/org.types';
import Privilege from '../../enums/Privilege';
import HttpUnauthorizedException from '../../exceptions/http/HttpUnauthorizedException';
import AppUser from '../../interfaces/models/AppUser';
import { IGrantingPrivileges } from '../../interfaces/services/ACrudService';
import AServiceBase from '../../interfaces/services/AServiceBase';
import IServiceBase from '../../interfaces/services/IServiceBase';
import enumUtil from '../../lib/enum.util';
import logger from '../../lib/logger';
import security from '../../lib/security.util';
import HoldingOrgModel from '../../models/org/holding-org.model';
import MemberOrgModel from '../../models/org/member-org.model';
import { DashboardConfigItem } from '../../models/org/org.types';
import HttpObjectNotFoundException from '../../exceptions/http/HttpObjectNotFoundException';

const dashboardModules = enumUtil.toArray(DashboardModule)

class HoldingOrgService extends AServiceBase implements IServiceBase {
  private grantingPrivileges: IGrantingPrivileges

  constructor() {
    super(
      'modules.org.OrgService'
    );

    this.grantingPrivileges = {
      createPrivileges: [Privilege.CLIENT_SETUP_EDIT],
      readPrivileges: [Privilege.CLIENT_SETUP_VIEW, Privilege.CLIENT_SETUP_EDIT],
      updatePrivileges: [Privilege.CLIENT_SETUP_EDIT],
      deletePrivileges: [Privilege.CLIENT_SETUP_EDIT]
    }
  }

  public async readDashboardConfig(appUser: AppUser, id: string, opts: any = {}) {

    this.isRoleBasedAccessAllowed(appUser, this.grantingPrivileges.readPrivileges);
    let holdingOrgQuery = {};
    if (Object.keys(opts).length && opts.holdingOrg &&  opts.modules?.length) {
      if (opts.holdingOrg && opts.modules.length) {
        holdingOrgQuery = {
          $and: [{ _id: { $in: [opts.holdingOrg] } }, {
            "dashboardConfig.module": {
              $in: opts.modules
            }
          }
          ]
        }
      }
      if (opts.holdingOrg && opts.modules.length < 1) {
        holdingOrgQuery = {
          _id: { $in: [opts.holdingOrg] }
        }
      }
      if (!opts.holdingOrg && opts.modules?.length && opts.memberOrg === "all") {
        holdingOrgQuery = {
          "dashboardConfig.module": {
            $in: opts.modules
          }
        }
      }
    }
    let memberOrgQuery = {};
    if (Object.keys(opts).length && opts.memberOrg &&  opts.memberOrg?.length) {
      if (opts.memberOrg && opts.modules.length ) {
        memberOrgQuery = {
          _id: { $in: [opts.memberOrg] }, "dashboardConfig.module": {
            $in: opts.modules
          }
        }
      }
      if (!opts.memberOrg && opts.modules?.length  < 0) {
        memberOrgQuery = {
          "dashboardConfig.module": {
            $in: opts.modules
          }
        }
      }
      if (opts.memberOrg && !opts.modules?.length && opts.memberOrg === "all" ) {
        memberOrgQuery = {
        _id: {
          $in:[opts.memberOrg]
        }
        }
      }
    }
    const holdingOrgs = await HoldingOrgModel.find(holdingOrgQuery)
      .select("_id name code dashboardConfig")
    const memberOrgs = await MemberOrgModel.find(memberOrgQuery)
      .select("_id name code dashboardConfig")
      .populate({ path: "holdingOrg", select: "_id code name" })
console.log(JSON.stringify(holdingOrgQuery), 'memberQuery ==>', JSON.stringify(memberOrgQuery))
    const orgDashboardConfigs: Array<DashboardResultItem> = [];
    //combine holding and member org data to generate a list of objects with
    if (holdingOrgs && holdingOrgs.length > 0) {
      holdingOrgs.forEach((holdingOrg:any)=> {
        orgDashboardConfigs.push({
          holdingOrgCode: holdingOrg.code,
          holdingOrgId: holdingOrg._id,
          holdingOrgName: holdingOrg.name,
          dashboardConfig: !!Object.keys(opts).length || opts?.modules?.length < 1  ? holdingOrg.dashboardConfig : this.enrichDashboardConfig(holdingOrg.dashboardConfig)
        })
      })
    }

    if (memberOrgs && memberOrgs.length > 0) {
      memberOrgs.forEach((memberOrg: any) => {
        orgDashboardConfigs.push({
          memberOrgCode: memberOrg.code,
          memberOrgId: memberOrg._id,
          memberOrgName: memberOrg.name,
          holdingOrgCode: memberOrg.holdingOrg?.code,
          holdingOrgId: memberOrg.holdingOrg?._id,
          holdingOrgName: memberOrg.holdingOrg?.name,
          dashboardConfig: !!Object.keys(opts).length ||  opts?.modules?.length < 1  ? memberOrg.dashboardConfig : this.enrichDashboardConfig(memberOrg.dashboardConfig)
        })
      });
    }
    return orgDashboardConfigs;
  }
  /**
 * Throws HttpUnauthorizedException if no access.
 * Uses lib.security.isRoleBasedAccessAllowed
 * @param roleSecurity The user's role security.
 * @param grantingPrivileges The list of privileges that grant access to this endpoint.
 */
  protected isRoleBasedAccessAllowed(appUser: AppUser, grantingPrivileges: Array<Privilege>): void {
    const isAllowed = security.isRoleBasedAccessAllowed(appUser, grantingPrivileges);
    if (!isAllowed) {
      logger.info(`${this.loggerString}:isRoleBasedAccessAllowed::User has no access`, { appUser, grantingPrivileges })
      throw new HttpUnauthorizedException('Your role does not allow access to this resource.');
    }
  }


  public async upsertDashboardConfig(appUser: AppUser, id: string, payload: DashboardResultItem) {
    this.isRoleBasedAccessAllowed(appUser, this.grantingPrivileges.updatePrivileges);

    let org: OrgDocument | null = null;
    let orgId = payload.memberOrgId || payload.holdingOrgId;
    if (payload.memberOrgId) {
      org = await MemberOrgModel.findById(orgId);
    } else {
      org = await HoldingOrgModel.findById(orgId);
    }

    if (org) {
      const newDashboardConfig = payload.dashboardConfig;
      for (let newDashboardConfigItem of newDashboardConfig) {
        if (org.dashboardConfig?.length > 0) {
          //check if module already exists
          const foundModuleConfig = org.dashboardConfig.findIndex(v => v.module === newDashboardConfigItem.module);
          if (foundModuleConfig >= 0) {
            org.dashboardConfig[foundModuleConfig] = newDashboardConfigItem;
          } else {

            org.dashboardConfig.push(newDashboardConfigItem)
          }
        } else {
          org.dashboardConfig.push(newDashboardConfigItem)
        }
      }

      await org.save()
      return org.dashboardConfig

    } else {
      throw new HttpObjectNotFoundException(`Org not found ${orgId}`)
    }
  }

  public enrichDashboardConfig(dashboardConfig: DashboardConfigItem[] = []): DashboardConfigItem[] {
    for (let module of dashboardModules) {
      const isModuleIncluded = dashboardConfig.some(v => v.module === module);

      if (!isModuleIncluded) {
        dashboardConfig.push({
          module: <any>module,
        })
      }
    }
    const sortedArray = dashboardConfig.sort((a, b) => {
      if (a.module > b.module) {
        return 1
      } else {
        return -1
      }
    }
    )
    return sortedArray
  }
}


export default HoldingOrgService


export type DashboardResultItem = {
  holdingOrgName: string;
  holdingOrgCode: string;
  holdingOrgId: string;
  memberOrgName?: string;
  memberOrgCode?: string;
  memberOrgId?: string;
  dashboardConfig: DashboardConfigItem[]
}
