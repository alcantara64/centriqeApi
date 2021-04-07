import bcrypt from 'bcrypt';
import { Secureable } from '../../interfaces/models/IRowLevelUserSecurity';
import validator from 'validator';
import DataDomain from '../../enums/DataDomain';
import DataDomainConfig from '../../enums/DataDomainConfig';
import Privilege from '../../enums/Privilege';
import AppException from '../../exceptions/AppException';
import HttpMethodNotAllowedException from '../../exceptions/http/HttpMethodNotAllowException';
import AppUser from '../../interfaces/models/AppUser';
import ACrudService from '../../interfaces/services/ACrudService';
import ICrudService from '../../interfaces/services/ICrudService';
import IServiceBase from '../../interfaces/services/IServiceBase';
import logger from '../../lib/logger';
import CustomerService from '../customer/CustomerService';
import HoldingOrgService from '../holding-org/HoldingOrgService';
import MemberOrgService, { LeanMemberOrg } from '../member-org/MemberOrgService';
import UserModel from '../../models/user/user.model';
import MessageEventService from '../message-event/MessageEventService';
import { UserDocument } from '../../models/user/user.types';
import SystemConfigService from '../system-config/SystemConfigService';
import { DashboardModule } from '../../models/org/org.types';


const dashboardModuleMapping = new Map< DashboardModule, string>();
dashboardModuleMapping.set(DashboardModule.HOME,"any");
dashboardModuleMapping.set(DashboardModule.ASK_BUDDY, Privilege.ASK_BUDDY_ANALYTICS);
dashboardModuleMapping.set(DashboardModule.COMM, Privilege.COMM_AI_ANALYTICS);
dashboardModuleMapping.set(DashboardModule.NPS, Privilege.NPS_ANALYTICS);
dashboardModuleMapping.set(DashboardModule.INSIGHT, Privilege.INSIGHT_ANALYTICS);
dashboardModuleMapping.set(DashboardModule.PROFIT_EDGE, Privilege.PROF_EDGE_ANALYTICS);
dashboardModuleMapping.set(DashboardModule.RESP, Privilege.RESP_AI_ANALYTICS);

class UserService extends ACrudService implements IServiceBase, ICrudService {
  public static LOGGER_STRING = 'modules.customer.UserService';
  private messageEventService: MessageEventService;
  private systemConfigService: SystemConfigService;

  constructor() {
    super(
      UserModel,
      UserService.LOGGER_STRING,
      {
        createPrivileges: [Privilege.USER_ADMIN_EDIT],
        readPrivileges: [Privilege.USER_ADMIN_VIEW, Privilege.USER_ADMIN_EDIT],
        updatePrivileges: [Privilege.USER_ADMIN_EDIT],
        deletePrivileges: [Privilege.USER_ADMIN_EDIT]
      },
      DataDomain.NONE
    );

    this.messageEventService = new MessageEventService();
    this.systemConfigService = new SystemConfigService();
  }

  protected isRowLevelSecurityEnabled(methodName: string): boolean {
    //no row-level security right now. If you have access to manipulate users, there is no further restriction.
    return false;
  }

  protected getMongooseQuerySelectOptions() {
    //do not return the password in standard curd end points
    return "-password";
  }

  protected getMongooseQueryPopulateOptions(methodName: "readOneById" | "readMany") {
    //do not return the password in standard curd end points
    return "roles";
  }


  /**
   * No security check. Supposed to be used only internally for authentication routes!
   * @param userIdOrEmail Can be userId or Email
   */
  public async findUserForAuthByIdOrEmailWithPassword(userIdOrEmail: string): Promise<any> {
    if (validator.isEmail(userIdOrEmail)) {
      return await UserModel.findOne({ email: userIdOrEmail }).populate('roles');
    } else {
      return await UserModel.findOne({ userId: userIdOrEmail }).populate('roles');
    }
  }

  /**
   * @override Needed to be implemnted here because of password hashing.
   */
  public async createOne(appUser: AppUser, payload: any): Promise<any> {
    logger.debug(`${this.loggerString}:createOne::Start`);

    this.isRoleBasedAccessAllowed(appUser, this.grantingPrivileges.createPrivileges);

    await this.hashPassword(payload);
    const newModel = new this.model(payload);

    await newModel.save();
    delete newModel._doc.password;
    return newModel;
  }


  /**
   * @override Needed to be implemnted here because of password hashing.
   */
  public async updateOneById(appUser: AppUser, id: string, payload: any): Promise<any> {
    logger.debug(`${this.loggerString}:updateOneById::Started`);

    this.isRoleBasedAccessAllowed(appUser, this.grantingPrivileges.updatePrivileges);
    const result = await this.readOneById(appUser, id);

    let passwordUpdated = false;
    let plainPassword = null;

    if (payload.password !== undefined) {
      logger.info(`${this.loggerString}:updateOneById::updating user password ${id}`);
      plainPassword = payload.password;
      await this.hashPassword(payload);
      passwordUpdated = true;

      payload.resetPasswordNextLogon = true;
    }

    Object.keys(payload).forEach(function (key) {
      result[key] = payload[key]
    })
    await result.save();

    if (passwordUpdated) {
      this.messageEventService.createOneSystemTransactionalEvent({
        to: result.email,
        subject: "Password was reset",
        body: `<html><body>Your password was reset to<br>${plainPassword}</body></html>`
      });
    }

    return result;
  }
  public async updatePassword(email: string, payload: any, isForgotPassword?: boolean): Promise<boolean> {
    logger.debug(`${this.loggerString}:updatePassword::Started`);

    let plainPassword = null;
    logger.info(`${this.loggerString}:updatePassword::updating user password with ${email}`);
    plainPassword = payload.password;
    await this.hashPassword(payload);
    payload.resetPasswordNextLogon = isForgotPassword ? true : false;
    const emailText = isForgotPassword ? `reset to<br>${plainPassword}` : 'changed, if you did not perform this action, please contact support';
    await this.model.findOneAndUpdate({ email }, payload);
    this.messageEventService.createOneSystemTransactionalEvent({
      to: email,
      subject: "Password was reset",
      body: `<html><body>Your password was ${emailText}</body></html>`
    });


    return true;
  }

  public async createMany(appUser: AppUser, payload: Array<any>): Promise<any> {
    logger.debug(`${this.loggerString}:createMany::Start`);

    throw new HttpMethodNotAllowedException("Method not implemented for this resource.");
  }


  /**
   * No security check. Supposed to be used only internally for authentication routes!
   * Populates roles and privileges
   * @param id Find user by database id.
   */
  public async findUserById(id: string): Promise<any> {
    return await UserModel.findById(id).select('-password').populate('roles');
  }



  /**
 * This is exclusively for the get:/user/me route
 * @param appUser
 */
  public async getUserDashboardConfigForOrg(appUser: AppUser, holdingOrgId: string) {
    let dashboardConfig;

    //in case it comes in as objectid
    holdingOrgId = holdingOrgId.toString();

    const holdingOrgService = new HoldingOrgService();
    const memberOrgService = new MemberOrgService();

    if (appUser.isAdmin) {
      //admins always have access to all orgs
      const holdingOrg = await holdingOrgService.findHoldingOrgById(holdingOrgId);
      dashboardConfig = holdingOrg?.dashboardConfig;
    } else {
      //does the user have access to the holding org?
      const hasAccessToHoldingOrg = appUser.communication.holdingOrgs?.includes(holdingOrgId);

      if (hasAccessToHoldingOrg) {
        //if user has access, use that dashboard
        const holdingOrg = await holdingOrgService.findHoldingOrgById(holdingOrgId);
        dashboardConfig = holdingOrg?.dashboardConfig;
      } else {
        //if the user does not have access on holding org level, does he have access on member org level?
        const memberOrg = await memberOrgService.findFirstActiveMemberOrgForUserByHoldingOrgId(appUser, holdingOrgId);
        dashboardConfig = memberOrg?.dashboardConfig;
      }

    }

    let privilegedDashboardConfig = []
    if (dashboardConfig) {
      //getting dashboard system-config-dashboard default Links link
      const systemConfig = await this.systemConfigService.readSystemConfigDashboardConfigForLogin()
      for (let dashboardmodule of dashboardModuleMapping.entries()) {
        let isValid = dashboardConfig.some((v: any) => v.module == dashboardmodule[0]);
        if (!isValid) {
          const tempDashboardconfig: any = {}
          tempDashboardconfig.module = dashboardmodule[0]
          tempDashboardconfig.dashboardName = systemConfig?.dashboardConfig?.dashboardName
          tempDashboardconfig.dashboardLink = systemConfig?.dashboardConfig?.dashboardLink
          dashboardConfig.push(tempDashboardconfig)
        }
      }


      if (dashboardConfig?.length) {
        for (let dashboardConfigItem of dashboardConfig) {
          let actualPreviledge = dashboardModuleMapping.get(dashboardConfigItem.module);
          let hasAccess = appUser.privileges.some((v: any) => v == actualPreviledge);
          if (hasAccess || dashboardConfigItem.module.toLowerCase() === 'home') {

            if(systemConfig?.dashboardConfig) {
              if (dashboardConfigItem.dashboardName === '' || dashboardConfigItem.dashboardName === null) {
                dashboardConfigItem.dashboardName = systemConfig?.dashboardConfig.dashboardName
              }
              if (dashboardConfigItem.dashboardLink == '' || dashboardConfigItem.dashboardLink == null) {
                dashboardConfigItem.dashboardLink = systemConfig?.dashboardConfig.dashboardLink
              }
            }

            privilegedDashboardConfig.push(dashboardConfigItem);
          }
        }
      }

    }

    return privilegedDashboardConfig;
  }

    /**
   * This is exclusively for the get:/user/me route
   * @param appUser
   * @deprecated
   */
  public  async getUserDashboardConfig(appUser: AppUser, holdingOrg: string, holdingOrgsForGlobalSelector?: any) {
    const user: UserDocument = await this.findUserById(appUser.id);
    let jsonUser: any = user.toJSON();
    let dashboardConfig: any;

    const holdingOrgService = new HoldingOrgService();
    const memberOrgService = new MemberOrgService();

    //Arranging dashboardconfig
    if(holdingOrg == null || holdingOrg == '')
    {
      if(user.isAdmin)
      {
        const holdashboardConfig = await holdingOrgService.findHoldingOrgsDashboardConfig(holdingOrgsForGlobalSelector.holdingOrgList[0]._id)
        if(holdashboardConfig.holdingOrgDashboardConfig != null)
        {
          dashboardConfig = holdashboardConfig.holdingOrgDashboardConfig.dashboardConfig;
        }

      }
      else
      {
        if(jsonUser.rowLevelSecurity.communication.hol.holdingOrgs.length > 0)
        {
          if(jsonUser.rowLevelSecurity.communication.hol.holdingOrgs.length > 0)
          {
            const holdashboardConfig = await holdingOrgService.findHoldingOrgsDashboardConfig(jsonUser.rowLevelSecurity.communication.hol.holdingOrgs[0]._id)
            if(holdashboardConfig.holdingOrgDashboardConfig != null)
            {
              dashboardConfig = holdashboardConfig.holdingOrgDashboardConfig.dashboardConfig;
            }
          }
          else
          {
            dashboardConfig = []
          }
        }
        else
        {
          if(jsonUser.rowLevelSecurity.communication.mol.holdingOrgs.length > 0)
          {
            const molOrg = await memberOrgService.findMemberOrgsByHoldingOrgId(jsonUser.rowLevelSecurity.communication.mol.holdingOrgs[0]._id)
            if(molOrg.length > 0)
            {
              const molholdashboardConfig = await memberOrgService.findMemberOrgsDashboardConfig(molOrg[0]._id)
              if(molholdashboardConfig.memberOrgDashboardConfig != null)
              {
                dashboardConfig = molholdashboardConfig.memberOrgDashboardConfig.dashboardConfig;
              }
            }
            else
            {
                dashboardConfig = []
            }
          }
          else if(jsonUser.rowLevelSecurity.communication.mol.memberOrgs.length > 0)
          {
            const moldashboardConfig = await memberOrgService.findMemberOrgsDashboardConfig(jsonUser.rowLevelSecurity.communication.mol.memberOrgs[0]._id)
            if(moldashboardConfig.memberOrgDashboardConfig != null)
            {
              dashboardConfig = moldashboardConfig.memberOrgDashboardConfig.dashboardConfig;
            }
          }
          else
          {
            dashboardConfig = []
          }
        }
      }
    }
    else
    {
      const holdashboardConfig = await holdingOrgService.findHoldingOrgsDashboardConfig(holdingOrg)
      if(holdashboardConfig.holdingOrgDashboardConfig != null)
      {
        dashboardConfig = holdashboardConfig.holdingOrgDashboardConfig.dashboardConfig;
      }
    }

    //getting dashboard system-config-dashboard default Links link
    const systemConfig = await this.systemConfigService.readSystemConfigDashboardConfigForLogin()
    for(let dashboardmodule of dashboardModuleMapping.entries())
    {
      let isValid = dashboardConfig.some((v: any) => v.module == dashboardmodule[0]);
      if(!isValid)
      {
        let tempDashboardconfig:any={}
        tempDashboardconfig.module = dashboardmodule[0]
        tempDashboardconfig.dashboardName = systemConfig?.dashboardConfig.dashboardName
        tempDashboardconfig.dashboardLink = systemConfig?.dashboardConfig.dashboardLink
        dashboardConfig.push(tempDashboardconfig)
      }

    }

    let privilegeddashboardConfig = []
    if(dashboardConfig?.length){
      for (let dashboardConfigitem of dashboardConfig) {
        let actualPreviledge = dashboardModuleMapping.get(dashboardConfigitem.module);
        let isValid = jsonUser.privileges.some((v: any) => v == actualPreviledge);
        if(isValid || dashboardConfigitem.module.toLowerCase() == 'home')
        {
          if(systemConfig)
          {
            if(dashboardConfigitem.dashboardName == '' || dashboardConfigitem.dashboardName == null  )
            {
              dashboardConfigitem.dashboardName = systemConfig?.dashboardConfig.dashboardName
            }
            if(dashboardConfigitem.dashboardLink == '' || dashboardConfigitem.dashboardLink == null  )
            {
              dashboardConfigitem.dashboardLink = systemConfig?.dashboardConfig.dashboardLink
            }
          }
          privilegeddashboardConfig.push(dashboardConfigitem);
        }
      }
    }
    return privilegeddashboardConfig;
  }

  /**
   * This is exclusively for the get:/user/me route
   * @param holdingOrgCode If provided, the data is filtered for provided holding org
   * @param appUser
   */
  public async findUserByIdWithStructureData(appUser: AppUser, holdingOrgCode?: string) {
    const user: UserDocument = await this.findUserById(appUser.id);
    const holdingOrgService = new HoldingOrgService();
    const holdingOrgsForGlobalSelector = await holdingOrgService.findAllHoldingOrgsForUserGlobalHoldingOrgSelection(user, holdingOrgCode);
    const customerService = new CustomerService();
    const systemConfig = await this.systemConfigService.readSystemConfigForLogin()

    //get plain object. mongoose lean doesnt work because we need virtuals
    let jsonUser: any = user.toJSON();


    if (holdingOrgsForGlobalSelector.holdingOrg) {
      jsonUser.holdingOrg = holdingOrgsForGlobalSelector.holdingOrg
      let dataAttributes: any = { "dataAttributes": {} };

      jsonUser.dashboardConfig = await this.getUserDashboardConfigForOrg(appUser, holdingOrgsForGlobalSelector.holdingOrg._id);

      dataAttributes.dataAttributes = await customerService.getSearchFilterDataBasedOnConfig(appUser, holdingOrgsForGlobalSelector.holdingOrg._id)
      jsonUser.holdingOrg.dataConfig["customer"] = dataAttributes

      jsonUser.holdingOrgList = holdingOrgsForGlobalSelector.holdingOrgList
    }
    jsonUser.systemConfig = systemConfig

    delete jsonUser.rowLevelSecurity;
    delete jsonUser.rowLevelSecurityFromUi;

    return jsonUser;
  }



  public async findAccessByHoldingOrg(appUser: AppUser, holdingOrgId: string): Promise<any> {
    const dataDomains = DataDomainConfig.getAsEnumArrayForHoldingOrgConfiguration();

    const memberOrgService = new MemberOrgService();
    const holdingOrg = await memberOrgService.findActiveHoldingOrgWithMemberOrgsLean(holdingOrgId);

    const result: any = {}

    if (holdingOrg) {
      const holdingOrgSlim: any = { ...holdingOrg };
      delete holdingOrgSlim.memberOrgs;
      delete holdingOrgSlim.dataDomainConfig;


      for (let dataDomain of dataDomains) {
        result[dataDomain] = {
          holdingOrgs: [],
          memberOrgs: []
        };
        const rowLevel = <Secureable>(<any>appUser)[dataDomain];

        const dataDomainConfigForDomain = (<any>holdingOrg.dataDomainConfig)[dataDomain];
        if (dataDomainConfigForDomain === undefined) {
          logger.error(`${UserService.LOGGER_STRING}:findAccessByHoldingOrg::There is a holdingOrg with missing dataDomainConfig.`, { dataDomain: dataDomain, holdingOrg });
          throw new AppException(`HoldingOrg is missing dataDomainConfig ${holdingOrg._id}`);
        }
        const dataOnHoldingOrgLevel = (<any>holdingOrg.dataDomainConfig)[dataDomain].holdingOrgLevel === true
        const dataOnMemberOrgLevel = (<any>holdingOrg.dataDomainConfig)[dataDomain].memberOrgLevel === true


        if (dataOnHoldingOrgLevel && (appUser.isAdmin || rowLevel.holdingOrgs.includes(holdingOrgId))) {
          result[dataDomain].holdingOrgs.push(holdingOrgSlim);
        }

        if (dataOnMemberOrgLevel) {
          if (appUser.isAdmin) {
            for (let mOrg of holdingOrg.memberOrgs) {
              result[dataDomain].memberOrgs.push(mOrg);
            }
          } else {
            const memberOrgMap = new Map<string, LeanMemberOrg>();
            for (let memberOrg of holdingOrg.memberOrgs) {
              memberOrgMap.set(memberOrg._id, memberOrg);
            }

            for (let memberOrg of rowLevel.memberOrgs) {
              if (memberOrgMap.has(memberOrg)) {
                result[dataDomain].memberOrgs.push(memberOrgMap.get(memberOrg));
              }
            }

          }

        }

      }
    }

    return result;
  }


  public async createAdminUser(payload: any) {
    logger.info(`${UserService.LOGGER_STRING}:createAdminUser::Start`);

    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      logger.info(`services.userService:createAdmin::Creating admin user.`)
      let userData = { userId: "admin", email: "admin@centriqe.com", name: "Admin", title: "Centriqe Admin", isAdmin: true }
      userData = { ...userData, ...payload };

      await this.hashPassword(userData);
      const newModel = new UserModel(userData);

      await newModel.save();
      delete (<any>newModel)._doc.password;
      return newModel;
    } else {
      logger.error(`${UserService.LOGGER_STRING}:createAdminUser::Admin user cannot be created. There are already users in the collection.`)
      throw new AppException("Admin user cannot be created. There are users in the collection already.")
    }
  }


  private hashPassword = async function (user: any): Promise<void> {
    //if (!user.password) throw user.invalidate('password', 'password is required')
    //if (user.password.length < 12) throw user.invalidate('password', 'password must be at least 12 characters')
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }

}

export default UserService
