import ACrudController from '../../interfaces/controllers/ACrudController';
import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import HoldingOrgService from './HoldingOrgService';
import { Router, Request, Response } from 'express';
import logger from '../../lib/logger';



class HoldingOrgController extends ACrudController implements IControllerBase, ICrudController {
  private holdingOrgService: HoldingOrgService;

  constructor() {
    super(
      new HoldingOrgService(),
      'modules.customer.HoldingOrgController'
    );

    this.holdingOrgService = <HoldingOrgService>this.crudService;
  }


  addRoutesBeforeStandardRoutes(router: Router): void {
    router.get('/tags', (req: Request, res: Response) => { return this.getOrgTags(req, res) });

  }

  public async getOrgTags(req: Request, res: Response): Promise<any> {
    logger.debug(`${this.loggerString}:getOrgTags::Start`);
    //const appUser = this.extractAppUser(req);

    //TODO: security will need to be added
    const tags = await this.holdingOrgService.findHoldingOrgTags();
    return res.send(tags);
  }

}


export default HoldingOrgController
