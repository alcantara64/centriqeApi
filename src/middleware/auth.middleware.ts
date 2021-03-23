import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy } from 'passport-local';
import { Request, Response, NextFunction } from 'express';

import logger from '../lib/logger';
import config from '../lib/config';
import UserService from '../modules/user/UserService';
import HttpStatus from '../enums/HttpStatus';
import AppUser from '../interfaces/models/AppUser';
import IRowLevelUserSecurity from '../interfaces/models/IRowLevelUserSecurity';
import MemberOrgService from '../modules/member-org/MemberOrgService';
import HttpUnauthorizedException from '../exceptions/http/HttpUnauthorizedException';
import DataDomainConfig from '../enums/DataDomainConfig';
import generator from 'generate-password';
import HttpBadRequestException from '../exceptions/http/HttpBadRequestException';
import HoldingOrgService from '../modules/holding-org/HoldingOrgService';
import ModelStatus from '../enums/ModelStatus';


const jwtSecret = config.jwtSecret;
const jwtOpts: jwt.SignOptions = { algorithm: 'HS256', expiresIn: '12h' }

passport.use(dbStrategy());
const authenticate = passport.authenticate('local', { session: false });

export default {
  authenticate,
  login,
  ensureUser,
  resetPassword,
}

async function login(req: Request, res: Response, next: NextFunction) {
  const userIdOrEmail = req.body.userId;
  logger.info(`milddleware.auth:login::Login of user started ${userIdOrEmail}`);
  const userService = new UserService();

  const user = await userService.findUserForAuthByIdOrEmailWithPassword(userIdOrEmail);

  if (!user) {
    throw new HttpUnauthorizedException("Invalid login credentials.");
  };

  const appUser = await buildAppUser(user);
  const userDetails = await userService.findUserByIdWithStructureData(appUser);
  const { holdOrgCode } = req.body;
  if (holdOrgCode) {
    const holdingOrgService = new HoldingOrgService();
    const holdOrg = await holdingOrgService.findHoldingOrgByCode(holdOrgCode);
    if (!holdOrg) {
      throw new HttpUnauthorizedException("Invalid login credentials.");
    }

    const hasHoldingOrg: boolean = userDetails.holdingOrgs.some((v: any) => {
      return v._id.toString() === holdOrg._id.toString()
    });

    if (!hasHoldingOrg) {
      throw new HttpUnauthorizedException("Invalid login credentials.");
    }

    userDetails.holdingOrgs = userDetails.holdingOrgs.filter((v: any) => {
      return v._id.toString() === holdOrg._id.toString()
    })
  }

  const token = await sign({
    _id: user._id,
    userId: user.userId,
    email: user.email,
    isAdmin: user.isAdmin //TODO remove later, only added for backwards compatibility
  });


  //res.cookie('jwt', token, { httpOnly: true }) Removing cookie for now.
  res.json({ token, userDetails });
}

async function ensureUser(req: Request, res: Response, next: NextFunction) {
  //const token = req.headers.authorization; //|| req.cookies.jwt removing cookie for now
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED.CODE).send('Access denied. No token provided.');
  }

  try {
    const userFromToken: any = await verify(token);
    const appUser: AppUser = await buildAppUserWithId(userFromToken._id);
    req.user = appUser;
    return next();
  } catch (error) {
    logger.error("milddleware.auth:ensureUser::Token verification error.", error);
    return res.status(HttpStatus.UNAUTHORIZED.CODE).send('Invalid token.');
  }
}

async function sign(payload: any) {
  const token = await jwt.sign(payload, jwtSecret, jwtOpts);
  return token
}

async function verify(jwtString = '') {
  jwtString = jwtString.replace(/^Bearer /i, '')

  try {
    const payload = await jwt.verify(jwtString, jwtSecret); //TODO need to check if this really works asynchronosly.
    return payload
  } catch (err) {
    logger.error("milddleware.auth:verify::There was an error verifying the auth token.", err);
    throw new HttpUnauthorizedException("Invalid token.", err.message);
  }
}

function dbStrategy() {
  return new Strategy(
    { usernameField: 'userId' },

    async function (username, password, cb) {
      const userService = new UserService();
      try {
        const user = await userService.findUserForAuthByIdOrEmailWithPassword(username);

        if (!user || user.status === ModelStatus.INACTIVE) {
          return cb(null, false)
        }

        const isUser = await bcrypt.compare(password, user.password)
        if (isUser) {
          return cb(null, { username: user.username })
        }
      } catch (err) {
        logger.error("milddleware.auth:dbStrategy::There was an error retrieving the user.", err);
        throw new HttpUnauthorizedException("User login failed.", err.message);
      }

      cb(null, false);
    })
}


async function buildAppUserWithId(id: string): Promise<AppUser> {
  const userService = new UserService();
  const user: any = await userService.findUserById(id);
  if(user && user.status === ModelStatus.INACTIVE){
    throw new HttpUnauthorizedException('User account has been deactivated');
  }

  const appUser = await buildAppUser(user)
  return appUser;
}

async function buildAppUser(user: any): Promise<AppUser> {
  const userSecurity = await buildRowLevelUserSecurityFromUser(user);

  const appUser = new AppUser(
    user._id,
    user.userId,
    user.name,
    user.email,
    user.isAdmin,
    user.privileges,

    userSecurity.customer,
    userSecurity.product,
    userSecurity.revenue,
    userSecurity.cost,
    userSecurity.communication,
    userSecurity.response,
    userSecurity.nps,
    userSecurity.profitEdge,
    userSecurity.marketPlace
  );

  return appUser;
}


async function buildRowLevelUserSecurityFromUser(user: any): Promise<IRowLevelUserSecurity> {
  const memberOrgService = new MemberOrgService();

  const userSecurity: IRowLevelUserSecurity = {
    isAdmin: user.isAdmin,

    customer: {
      holdingOrgs: [],
      memberOrgs: []
    },
    product: {
      holdingOrgs: [],
      memberOrgs: []
    },
    revenue: {
      holdingOrgs: [],
      memberOrgs: []
    },
    cost: {
      holdingOrgs: [],
      memberOrgs: []
    },
    communication: {
      holdingOrgs: [],
      memberOrgs: []
    },
    response: {
      holdingOrgs: [],
      memberOrgs: []
    },
    nps: {
      holdingOrgs: [],
      memberOrgs: []
    },
    profitEdge: {
      holdingOrgs: [],
      memberOrgs: []
    },
    marketPlace: {
      holdingOrgs: [],
      memberOrgs: []
    }

  };


  //forEach works with async differently than map. forEach doesnt wait until async function is finished whereas map does
  //https://advancedweb.hu/how-to-use-async-functions-with-array-foreach-in-javascript/#:~:text=The%20async%20forEach%20is%20easy%20to%20use%2C%20but,run%20them%20one%20by%20one%2C%20use%20a%20reduce.
  //currentUser.clientDataAccess.forEach(async (item) => {
  //no using another alternative for(...) loop
  if (!userSecurity.isAdmin) {
    const dataDomains = DataDomainConfig.getAsEnumArrayForHoldingOrgConfiguration();


    for (let dataDomain of dataDomains) {
      let userSecurityHoldingOrgs = [];
      const holHoldingOrgs = user.rowLevelSecurity[dataDomain].hol.holdingOrgs

      if (holHoldingOrgs && holHoldingOrgs.length > 0) {
        userSecurityHoldingOrgs = holHoldingOrgs.map((v: any) => v.toString());
      }

      (<any>userSecurity)[dataDomain].holdingOrgs = userSecurityHoldingOrgs;



      let userSecurityMemberOrgs = [];
      const molHoldingOrgs = user.rowLevelSecurity[dataDomain].mol.holdingOrgs
      const molMemberOrgs = user.rowLevelSecurity[dataDomain].mol.memberOrgs

      if (molHoldingOrgs && molHoldingOrgs.length > 0) {
        logger.debug(`middleware.auth:buildRowLevelUserSecurityFromUser::User has access to all memberOrgs of holdingOrg ${molHoldingOrgs}`);
        const memberOrgIds: any = await memberOrgService.findMemberOrgsByHoldingOrgIdsLean(molHoldingOrgs);
        userSecurityMemberOrgs = memberOrgIds.map((v: any) => v._id.toString());
      }

      if (molMemberOrgs && molMemberOrgs.length > 0) {
        const test = molMemberOrgs.map((v: any) => {
          console.log(v);
          return v.toString()
        });
        userSecurityMemberOrgs = [...userSecurityMemberOrgs, ...test];
      }

      (<any>userSecurity)[dataDomain].memberOrgs = userSecurityMemberOrgs;
    }
  }

  return userSecurity;
};

async function resetPassword(req: Request, res: Response) {
  const { email } = req.body;
  logger.info(`milddleware.auth:resetPassword::Reset of user password started ${email}`);
  if (!email) {
    throw new HttpBadRequestException("email is required");
  }
  const userService = new UserService();

  const user = await userService.findUserForAuthByIdOrEmailWithPassword(email);
  if (!user) {
    throw new HttpUnauthorizedException("We don't this records in our system");
  }
  if(user && user.status === ModelStatus.INACTIVE){
    throw new HttpUnauthorizedException('User account has been deactivated');
  }

  //generate random string
  const randomString = generator.generate({ numbers: true, length: 10 });
  const payload = {
    password: randomString,
  }
  await userService.updatePassword(email, payload, true);
  return res.status(HttpStatus.OK.CODE).json({
    message: `A new password has been generated and sent to this  email ${email}`
  })

}
