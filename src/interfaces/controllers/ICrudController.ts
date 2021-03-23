import { Request, Response } from 'express';

interface ICrudController {
  create(req: Request, res: Response): Promise<any>;
  readOne(req: Request, res: Response): Promise<any>;
  readMany(req: Request, res: Response): Promise<any>;
  updateOne(req: Request, res: Response): Promise<any>;
  updateMany(req: Request, res: Response): Promise<any>;
  delete(req: Request, res: Response): Promise<any>;

  search(req: Request, res: Response): Promise<any>;
  getSearchFilterDataBasedOnConfig(req: Request, res: Response): Promise<any>;
}

export default ICrudController


export type CrudControllerRouteOptions = {
  create?: boolean;
  readOne?: boolean;
  readMany?: boolean;
  updateOne?: boolean;
  updateMany?: boolean;
  delete?: boolean;

  search?: boolean;
}
