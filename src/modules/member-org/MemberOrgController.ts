import express from 'express';
import { Request, Response } from 'express';

import ACrudController from '../../interfaces/controllers/ACrudController';
import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import MemberOrgService from './MemberOrgService';
import logger from '../../lib/logger';



class MemberOrgController extends ACrudController implements IControllerBase, ICrudController {

  constructor() {
    super(
      new MemberOrgService(),
      'modules.customer.MemberOrgController'
    );
  }

  addRoutesBeforeStandardRoutes(router: express.Router): void {
    router.get('/holdingOrg/:id', (req: Request, res: Response) => {return this.readMemberOrgsByHoldingOrgId(req, res)});
  }


  /**
   * TODO: No security implemented at the moment
   * @param req
   * @param res
   */
  public async readMemberOrgsByHoldingOrgId(req: Request, res: Response): Promise<any> {
    logger.debug(`${this.loggerString}:readMemberOrgsByHoldingOrgId::Start`);
    const id = req.params.id;

    const service = <MemberOrgService>this.crudService
    const memberOrgs = await service.findMemberOrgsByHoldingOrgId(id);
    return res.send(memberOrgs);
  };
}


export default MemberOrgController
