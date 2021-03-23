import express from 'express';
import IControllerBase from './IControllerBase';

abstract class AControllerBase implements IControllerBase {
  #router: express.Router;

  constructor(
    protected loggerString: string,

    /** 2021-01-07 FK - I'd normally handle this in the implementing class, but attribute will be undefined in initRoutes() because called before assignment */
    protected routeOptions?: any
  ) {
    this.#router = express.Router();
    this.initRoutes(this.#router, this.routeOptions);
  }

  abstract initRoutes(router: express.Router, routeOptions? : any): void;

  getRouter(): express.Router {
    return this.#router;
  }
}

export default AControllerBase
