import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger'
import _ from 'lodash'
import HttpStatus from '../enums/HttpStatus'
import HttpException from '../exceptions/http/HttpException';
import AppException from '../exceptions/AppException';


export default {
  handleError,
  handleAppError,
  handleValidationError,
  notFound
}


function standardErrorLogMsg(req: Request) {
  return `url: ${req.originalUrl?req.originalUrl+' -- ':''}`;
}

function handleError(err: any, req: Request, res: Response, next: NextFunction) {
  const logMessage = standardErrorLogMsg(req);
  logger.error(`middleware.error:handleError::${logMessage}`, err)

  if (res.headersSent) {
    //see "The default error handler" http://expressjs.com/en/guide/error-handling.html#error-handling
    return next(err);
  }

  const httpStatus = err.statusCode || 500

  return res
    .status(httpStatus)
    .json({
      httpStatus: httpStatus,
      errorType: 'Error',
      errorMessage: HttpStatus.INTERNAL_SERVER_ERROR.MESSAGE,
      message: HttpStatus.INTERNAL_SERVER_ERROR.MESSAGE //legacy response
    });
}


function handleAppError(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppException) {
    const logMessage = standardErrorLogMsg(req);
    logger.error(`middleware.error:handleAppError::${logMessage}`, err)
    const httpStatus = HttpStatus.NOT_FOUND.CODE;


    return res
      .status(httpStatus)
      .json({
        httpStatus: (err instanceof HttpException)?err.httpStatus:HttpStatus.INTERNAL_SERVER_ERROR.CODE,
        errorType: err.name,
        errorMessage: err.message,
        errorDetails: err.details,
        message: err.message //legacy response
      });
  }
  return next(err);
}

function handleValidationError(err: any, req: Request, res: Response, next: NextFunction) {
  if (err.name === 'ValidationError') {
    logger.error(`middleware.error:handleValidationError::`, err)
    const httpStatus = HttpStatus.BAD_REQUEST.CODE;

    let validationErrors = _.map(err.errors, a => a.message);

    return res
      .status(httpStatus)
      .json({
        httpStatus: httpStatus,
        errorType: err.name,
        errorMessage: err._message,
        validationErrors: validationErrors,
        errorDetails: err.errors,
        message: _.join(validationErrors, ', ') //legacy response
      });
  }
  return next(err);
}


function notFound(req: Request, res: Response) {
  //https://stackoverflow.com/questions/10849687/express-js-how-to-get-remote-client-address
  logger.error(`middleware.error:handleValidationError::Route not found ${req.ip} ${req.originalUrl}`);
  const httpStatus = HttpStatus.NOT_FOUND.CODE;

  return res
    .status(httpStatus)
    .json({
      httpStatus: httpStatus,
      errorType: 'NotFound',
      errorMessage: 'Route not found',
      errorDetails: `Route ${req.originalUrl} not found`,
      message: 'Route not found' //legacy response
    });
}


