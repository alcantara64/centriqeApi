
import express from 'express';
interface IControllerBase {
  initRoutes(router: express.Router): void;
  getRouter(): express.Router
}

export default IControllerBase
