import { Request, Response, Router } from 'express';
import HttpStatus from '../../enums/HttpStatus';
import AControllerBase from '../../interfaces/controllers/AControllerBase';
import IControllerBase from '../../interfaces/controllers/IControllerBase';
import AppUser from '../../interfaces/models/AppUser';
import OrgService from './OrgService';


class HoldingOrgController extends AControllerBase implements IControllerBase {
  private orgService: OrgService
  constructor() {
    super(
      'modules.org.OrgController'
    );

    this.orgService = new OrgService()
  }

  public initRoutes(router: Router): void {
    router.get('/dashboardConfig', (req: Request, res: Response) => { return this.readDashboardConfig(req, res) });
    router.post('/dashboardConfig/filter', (req: Request, res: Response) => { return this.filterDashboardConfig(req, res) });
    router.put('/dashboardConfig', (req: Request, res: Response) => { return this.updateDashboardConfig(req, res) });
  }

  public async readDashboardConfig(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    const id = req.params.id;
    const result = await this.orgService.readDashboardConfig(appUser, id, req.query);
    res.status(HttpStatus.OK.CODE).json(result);
  }
  public async filterDashboardConfig(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    const result = await this.orgService.readDashboardConfig(appUser, '', req.body);
    res.status(HttpStatus.OK.CODE).json(result);
  }

  public async updateDashboardConfig(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    const id = req.params.id;
    const result = await this.orgService.upsertDashboardConfig(appUser, id, req.body);
    res.status(HttpStatus.OK.CODE).json(result);
  }


  protected extractAppUser(req: Request): AppUser {
    return <AppUser>req.user;
  }

}


export default HoldingOrgController
