import express, { Request, Response } from 'express';
import { upload } from '../../middleware/multer.middleware';
import HttpStatus from '../../enums/HttpStatus';
import HttpBadRequestException from '../../exceptions/http/HttpBadRequestException';
import logger from '../../lib/logger';
import docMiddleware from '../../middleware/doc.middleware';
import AppUser from '../models/AppUser';
import ICrudService from '../services/ICrudService';
import AControllerBase from "./AControllerBase";
import IControllerBase from "./IControllerBase";
import ICrudController, { CrudControllerRouteOptions } from "./ICrudController";

abstract class ACrudController extends AControllerBase implements IControllerBase, ICrudController {


  constructor(
    protected crudService: ICrudService,
    loggerString: string,
    routeOptions?: CrudControllerRouteOptions) {
    super(loggerString, routeOptions);
  }


  public initRoutes(router: express.Router, routeOptions?: CrudControllerRouteOptions): void {

    this.addRoutesBeforeStandardRoutes(router, routeOptions);


    if (!routeOptions || routeOptions.search) {
      logger.log('silly', `${this.loggerString}:initRoutes::Registering search routes.`)

      //arrow functions need to be used to bind "this" to the instance of this class
      router.post('/search', (req: Request, res: Response) => { return this.searchSendResponse(req, res) });
      router.get('/search/:holdingOrgId', (req: Request, res: Response) => { return this.getSearchFilterDataBasedOnConfigSendResponse(req, res) });
    }

    if (!routeOptions || routeOptions.create) {
      logger.log('silly', `${this.loggerString}:initRoutes::Registering create route.`)
      router.post('/', [upload.single('file'), docMiddleware.documentModifier, docMiddleware.documentCreator], (req: Request, res: Response) => { return this.createSendResponse(req, res) });
    }

    if (!routeOptions || routeOptions.readOne) {
      logger.log('silly', `${this.loggerString}:initRoutes::Registering readOne route.`)
      router.get('/:id', (req: Request, res: Response) => { return this.readOneSendResponse(req, res) });
    }

    if (!routeOptions || routeOptions.readMany) {
      logger.log('silly', `${this.loggerString}:initRoutes::Registering readMany route.`)
      router.get('/', (req: Request, res: Response) => { return this.readManySendResponse(req, res) });
    }

    if (!routeOptions || routeOptions.updateOne) {
      logger.log('silly', `${this.loggerString}:initRoutes::Registering updateOne route.`)
      router.put('/:id', [upload.single('file'), docMiddleware.documentModifier], (req: Request, res: Response) => { return this.updateOneSendResponse(req, res) });
    }

    if (!routeOptions || routeOptions.updateMany) {
      logger.log('silly', `${this.loggerString}:initRoutes::Registering updateMany route.`)
      router.put('/', docMiddleware.documentModifier, (req: Request, res: Response) => { return this.updateManySendResponse(req, res) });
    }

    if (!routeOptions || routeOptions.delete) {
      logger.log('silly', `${this.loggerString}:initRoutes::Registering delete route.`)
      router.delete('/:id', (req: Request, res: Response) => { return this.deleteSendResponse(req, res) });
    }

    this.addRoutesAfterStandardRoutes(router, routeOptions);
  }


  addRoutesBeforeStandardRoutes(router: express.Router, routeOptions?: any): void {
    //empty implementation, can be overwritten
  }

  addRoutesAfterStandardRoutes(router: express.Router, routeOptions?: any): void {
    //empty implementation, can be overwritten
  }



  public async createSendResponse(req: Request, res: Response): Promise<any> {
    const obj = await this.create(req, res);
    res.status(HttpStatus.OK.CODE).json(obj);
  }
  public async create(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    this.processPayloadCreate(appUser, req.body);

    if (Array.isArray(req.body)) {
      logger.debug(`${this.loggerString}:create::Processing array.`);
      this.processPayloadCreateMany(appUser, req.body);
      const results = await this.crudService.createMany(appUser, req.body);
      return results;

    } else {
      logger.debug(`${this.loggerString}:create::Processing single item.`);
      this.processPayloadCreateOne(appUser, req.body);
      //check for unique code happens in model
      const result = await this.crudService.createOne(appUser, req.body);
      return result;
    }
  }



  public async readOneSendResponse(req: Request, res: Response): Promise<any> {
    const obj = await this.readOne(req, res);
    res.status(HttpStatus.OK.CODE).json(obj);
  }
  public async readOne(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    this.processPayloadReadOne(appUser, req.params);
    const id = req.params.id;
    const result = await this.crudService.readOneById(appUser, id);
    return result;
  }



  public async readManySendResponse(req: Request, res: Response): Promise<any> {
    const obj = await this.readMany(req, res);
    res.status(HttpStatus.OK.CODE).json(obj);
  }
  public async readMany(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    const results = await this.crudService.readMany(appUser, req.query);
    return results;
  }



  public async updateOneSendResponse(req: Request, res: Response): Promise<any> {
    const obj = await this.updateOne(req, res);
    res.status(HttpStatus.OK.CODE).json(obj);
  }
  public async updateOne(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    this.processPayloadUpdateOne(appUser, req.params, req.body);
    const id = req.params.id;
    const result = await this.crudService.updateOneById(appUser, id, req.body);
    return result;
  }



  public async updateManySendResponse(req: Request, res: Response): Promise<any> {
    const obj = await this.updateMany(req, res);
    res.status(HttpStatus.OK.CODE).json(obj);
  }
  public async updateMany(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    this.processPayloadUpdateMany(appUser, req.body);
    const results = await this.crudService.updateMany(appUser, req.body);
    return results;
  }



  public async deleteSendResponse(req: Request, res: Response): Promise<any> {
    const obj = await this.delete(req, res);
    res.status(HttpStatus.OK.CODE).json(obj);
  }
  public async delete(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    this.processPayloadDelete(appUser, req.params);
    const id = req.params.id;
    const result = await this.crudService.deleteOneById(appUser, id);
    return result;
  }


  public async searchSendResponse(req: Request, res: Response): Promise<any> {
    const obj = await this.search(req, res);
    res.status(HttpStatus.OK.CODE).json(obj);
  }
  public async search(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    const searchQueryOpts = req.body;

    let result = null;
    if (searchQueryOpts.query) {
      result = await this.crudService.searchByQuery(appUser, searchQueryOpts);
    }
    else if (searchQueryOpts.queryByCriteria) {
      result = await this.crudService.searchByFilterCriteria(appUser, searchQueryOpts);
    }
    else {
      throw new HttpBadRequestException("Query or criteria attributes need to be specified.");
    }

    return result;
  }

  public async getSearchFilterDataBasedOnConfigSendResponse(req: Request, res: Response): Promise<any> {
    const obj = await this.getSearchFilterDataBasedOnConfig(req, res);
    res.status(HttpStatus.OK.CODE).json(obj);
  }
  public async getSearchFilterDataBasedOnConfig(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    return await this.crudService.getSearchFilterDataBasedOnConfig(appUser, req.params.holdingOrgId);
  }



  /**
   * Can be overwritten if needed.
   * @param req
   */
  protected extractAppUser(req: Request): AppUser {
    return <AppUser>req.user;
  }

  /**
   * Can be used to modify the payload.
   * @param appUser
   * @param payload
   */
  protected processPayloadCreate(appUser: AppUser, payload: any): void { }
  protected processPayloadCreateOne(appUser: AppUser, payload: any): void { }
  protected processPayloadCreateMany(appUser: AppUser, payload: any): void { }
  protected processPayloadReadOne(appUser: AppUser, params: any): void { }
  protected processPayloadUpdateOne(appUser: AppUser, params: any, payload: any): void { }
  protected processPayloadUpdateMany(appUser: AppUser, payload: any): void { }
  protected processPayloadDelete(appUser: AppUser, params: any): void { }

}

export default ACrudController
