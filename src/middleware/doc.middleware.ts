import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';
import HttpStatus from '../enums/HttpStatus';
import AppUser from '../interfaces/models/AppUser';


export default {
  documentModifier,
  documentCreator
}

function documentModifier(req: Request, res: Response, next: NextFunction) {
  const user: AppUser = <AppUser>req.user;

  if (req.body && req.user && user.id) {

    if (Array.isArray(req.body)) {
      req.body.forEach(function (e) {
        e.modifiedBy = user.id;
      });
    } else {
      req.body.modifiedBy = user.id;
    }

    next();
  } else {
    logger.error('middleware.doc:documentModifier::User not set. This should not happen. It\'s very likely that a code fix is needed.');
    res.status(HttpStatus.INTERNAL_SERVER_ERROR.CODE).send('User not set.');
  }
}

function documentCreator(req: Request, res: Response, next: NextFunction) {
  const user: AppUser = <AppUser>req.user;

  if (req.body && req.user && user.id) {

    if (Array.isArray(req.body)) {
      req.body.forEach(function (e) {
        e.createdBy = user.id;
      });
    } else {
      req.body.createdBy = user.id;
    }

    next();
  } else {
    logger.error('middleware.doc:documentCreator::User not set. This should not happen. It\'s very likely that a code fix is needed.');
    res.status(HttpStatus.INTERNAL_SERVER_ERROR.CODE).send('User not set.');
  }
}
