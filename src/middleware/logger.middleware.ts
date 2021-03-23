import { Request, Response } from 'express';
import logger from '../lib/logger';

const loggerMiddleware = (req: Request, resp: Response, next: Function) => {

    logger.debug('middleware.logger::Request logged:', req.method, req.path)
    next()
}

export default loggerMiddleware
