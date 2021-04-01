import express from 'express';
import { Request, Response } from 'express';
import ACrudController from '../../interfaces/controllers/ACrudController';
import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import UserService from './UserService';

import AppUser from '../../interfaces/models/AppUser';
import logger from '../../lib/logger';
import HoldingOrgService from '../holding-org/HoldingOrgService';
import CustomerService from '../customer/CustomerService';


class UserController extends ACrudController implements IControllerBase, ICrudController {
  private static LOGGER_STRING = 'modules.customer.UserController';

  constructor(createAdminRoute?: boolean) {
    super(
      new UserService(),
      UserController.LOGGER_STRING,
      <any>{ createAdminUser: createAdminRoute, create: !createAdminRoute, delete: !createAdminRoute, readMany: !createAdminRoute, readOne: !createAdminRoute, search: !createAdminRoute, updateMany: !createAdminRoute, updateOne: !createAdminRoute }
    );
  }



  addRoutesBeforeStandardRoutes(router: express.Router, routeOptions?: any): void {
    if (!routeOptions?.createAdminRoute) router.get('/me', (req: Request, res: Response) => { return this.readMe(req, res) });
    if (!routeOptions?.createAdminRoute) router.get('/orgAccess/:id', (req: Request, res: Response) => { return this.readHoldingOrgAccess(req, res) });
    if (!routeOptions?.createAdminRoute) router.post('/update_password', (req: Request, res: Response) => { return this.updatePassword(req, res, false) });

    if (routeOptions?.createAdminUser) {
      logger.log('silly', `${this.loggerString}:initRoutes::Registering createAdmin route.`)
      router.post('/', (req: Request, res: Response) => { return this.createAdminUser(req, res) });
    }
  }


  public async readMe(req: Request, res: Response): Promise<any> {
    logger.debug(`${UserController.LOGGER_STRING}:readMe::Start`);
    const userService = <UserService>this.crudService
    const user = await userService.findUserByIdWithStructureData(<AppUser>req.user);
    return res.send(user);
  }

  public async readHoldingOrgAccess(req: Request, res: Response): Promise<any> {
    logger.debug(`${UserController.LOGGER_STRING}:readHoldingOrgAccess::Start`);
    const appUser = this.extractAppUser(req);
    const userService = <UserService>this.crudService
    const id = req.params.id;
    const holdingOrgAccess : any = {}

    const result = await userService.findAccessByHoldingOrg(appUser, id);
    holdingOrgAccess["dataDoaminConfig"] = result

    const holdingOrgService = new HoldingOrgService();
    const holdingOrg = await holdingOrgService.findOneHoldingOrgsForUserGlobalHoldingOrgSelection(id)
    holdingOrgAccess["holdingOrg"] = holdingOrg.holdingOrg;

    const customerService = new CustomerService();
    const attributeConfig = await customerService.getSearchFilterDataBasedOnConfig(appUser,id);
    holdingOrgAccess.holdingOrg.dataConfig = {
      customer: {
        dataAttributes: attributeConfig
      }
    }

    holdingOrgAccess["dashboardConfig"] = await userService.getUserDashboardConfigForOrg(appUser,id)

    return res.send(holdingOrgAccess);
  }

  public async updatePassword(req: Request, res: Response, isNew:boolean): Promise<any> {
    logger.debug(`${UserController.LOGGER_STRING}:updatePassword::Start`);
    const { password } = req.body
    const appUser = this.extractAppUser(req);
    const userService = <UserService>this.crudService

    await userService.updatePassword(appUser.email,{password}, isNew);

    return res.send({message:'Password updated successfully'});
  }


  public async createAdminUser(req: Request, res: Response): Promise<any> {
    logger.info(`${UserController.LOGGER_STRING}:createAdmin::Start`);
    const userService = <UserService>this.crudService
    const user = await userService.createAdminUser(req.body);
    return res.send(user);
  }

}

export default UserController
