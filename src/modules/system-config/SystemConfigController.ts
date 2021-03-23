import { Request, Response, Router } from 'express';
import AControllerBase from '../../interfaces/controllers/AControllerBase';
import IControllerBase from '../../interfaces/controllers/IControllerBase';
import SystemConfigService from './SystemConfigService';
import docMiddleware from '../../middleware/doc.middleware';
import AppUser from '../../interfaces/models/AppUser';



class SystemConfigController extends AControllerBase implements IControllerBase {
  private systemConfigService

  constructor() {
    super(
      'modules.system-config.SystemConfigController',
    );

    this.systemConfigService = new SystemConfigService();
  }

  public initRoutes(router: Router, routeOptions?: any): void {

    router.post('/', [docMiddleware.documentModifier, docMiddleware.documentCreator], (req: Request, res: Response) => { return this.create(req, res) });
    router.get('/', (req: Request, res: Response) => { return this.readSystemConfig(req, res) });

    router.put('/dataConfig/customer/dataGroups', (req: Request, res: Response) => { return this.updateDataConfigCustomerDataGroups(req, res) });
    router.put('/dataConfig/customer/dataGroups/:dataGroupId', (req: Request, res: Response) => { return this.updateSubDoc(req, res) });
    router.delete('/dataConfig/customer/dataGroups/:dataGroupId', (req: Request, res: Response) => { return this.deleteDataGroup(req, res) });
   
    router.put('/dataConfig/customer/dataAttributes', (req: Request, res: Response) => { return this.updateDataConfigCustomerDataAttributes(req, res) });
    router.put('/dataConfig/customer/dataAttributes/:dataAttributeId', (req: Request, res: Response) => { return this.updateDataConfigCustomerDataAttribute(req, res) });
    router.delete('/dataConfig/customer/dataAttributes/:dataAttributeId', (req: Request, res: Response) => { return this.updateDataConfigCustomerDataAttribute(req, res) });

    // enum types
    router.put('/dataConfig/customer/dataEnumTypes', (req: Request, res: Response) => { return this.updateDataEnum(req, res) });
    
    // dashboard config
    router.put('/default/dashboardConfig', (req: Request, res: Response) => { return this.updateDashboardConfig(req, res) });

  }


  public async create(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    const result = await this.systemConfigService.createSystemConfig(appUser);
    return res.json(result);
  }

  public async readSystemConfig(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    const result = await this.systemConfigService.readSystemConfig(appUser);
    return res.json(result);
  }

  public async updateDataConfigCustomerDataGroups(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    const result = await this.systemConfigService.updateDataConfigCustomerDataGroups(appUser, req.body);
    return res.json(result);
  }

  // to be removed if not needed
  public async updateDataConfigCustomerDataAttributes(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    const result = await this.systemConfigService.updateDataConfigCustomerDataAttributes(appUser, req.body);
    return res.json(result);
  }
  // single document
  public async updateDataConfigCustomerDataAttribute(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    const result = await this.systemConfigService.updateDataAttributeDocById(appUser, req.params.dataAttributeId, req.body);
    return res.json(result);
  }


  /**
   * This does not work yet!
   * @param req
   * @param res
   */
  public async updateSubDoc(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    const path = this.getObjectPathFromUrl(req.url)
    const result = await this.systemConfigService.updateOneSubDocById(appUser, path, req.params.dataGroupId, req.body);
    return res.json(result);
  }
  public async deleteDataAttribute(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    const result = await this.systemConfigService.removeDataAttributeById(appUser, req.params.dataAttributeId);
    return res.json(result);
  }
  public async deleteDataGroup(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    const groupCode = req.body.code;
    const result = await this.systemConfigService.removeDataGroupById(appUser, req.params.dataAttributeId, groupCode);
    return res.json(result);
  }


  private getObjectPathFromUrl(url: string): string {
    return url.split("/").join(".").substring(1);
  }

  protected extractAppUser(req: Request): AppUser {
    return <AppUser>req.user;
  }
  // #region dashboard Config default link
  public async updateDashboardConfig(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    const result = await this.systemConfigService.updateDashboardConfig(appUser, req.body);
    return res.json(result);
  // //#endregion

}
  // #region dashboard Config default link
  public async updateDataEnum(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    const result = await this.systemConfigService.updateCustomerConfigEnumTypes(appUser, req.body);
    return res.json(result);
  // //#endregion

}

}


export default SystemConfigController
