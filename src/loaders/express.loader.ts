import * as bodyParser from 'body-parser';
import cors from 'cors';
import * as express from 'express';
import 'express-async-errors'; //https://dev.to/ama/how-to-use-express-js-error-handling-middleware-to-make-your-code-cleaner-34j3
import helmet from 'helmet';
import NpsCampaignController from '../modules/campaign/NpsCampaignController';
import auth from '../middleware/auth.middleware';
import errorMiddleware from '../middleware/error.middleware';
import CommCampaignController from '../modules/campaign/CommCampaignController';
import RespCampaignController from '../modules/campaign/RespCampaignController';
import CustomerController from '../modules/customer/CustomerController';
import EmailTemplateController from '../modules/email-template/EmailTemplateController';
import HoldingOrgController from '../modules/holding-org/HoldingOrgController';
import MemberOrgController from '../modules/member-org/MemberOrgController';
import OrgController from '../modules/org/OrgController';
import MessageEventController from '../modules/message-event/MessageEventController';
import MessageTemplateController from '../modules/message-template/MessageTemplateController';
import MessageController from '../modules/message/MessageController';
import RespTypeController from '../modules/resp-type/RespTypeController';
import RoleController from '../modules/role/RoleController';
import StaticsController from '../modules/statics/StaticsController';
import NpsSurveyInstanceController from '../modules/survey-instance/NpsSurveyInstanceController';
import RespSurveyInstanceController from '../modules/survey-instance/RespSurveyInstanceController';
import NpsSurveyController from '../modules/survey/NpsSurveyController';
import RespSurveyController from '../modules/survey/RespSurveyController';
import NpsSurveyComponentController from '../modules/survey-component/NpsSurveyComponentController';
import RespSurveyComponentController from '../modules/survey-component/RespSurveyComponentController';
import UserController from '../modules/user/UserController';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../swagger.json';
import SystemConfigController from '../modules/system-config/SystemConfigController';
import CustomerFileUploadController from '../modules/file-upload/CustomerFileUploadController';
import CampaignController from '../modules/campaign/CampaignController';



//export default async ({ app }: { app: express.Application }) => {
export default async (app: express.Application) => {
  try{
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get('/status', (req, res) => { res.status(200).end(); });
  app.head('/status', (req, res) => { res.status(200).end(); });
  //app.enable('trust proxy'); need to check if necessary

  app.use(helmet());
  app.use(cors());
  //app.use(require('morgan')('dev'));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json({ limit: "10MB" }));


  /********** login route **********/
  app.post('/login', auth.authenticate, auth.login);
  app.post('/forgot_password', auth.resetPassword);
  app.post('/reset_password',auth.ensureUser, auth.resetPassword);
  app.post('/user/sign_in', auth.authenticate, auth.login); //legacy; will be removed once frontend is adjusted

  /********** unprotected routes **********/
  app.use('/user/createAdmin', (new UserController(true)).getRouter()); //works only if no users in database


  /********** secured routes **********/
  app.use(auth.ensureUser);
  app.use('/user/users', (new UserController()).getRouter());
  app.use('/user/roles', (new RoleController()).getRouter());

  app.use('/orgs', (new OrgController().getRouter()));
  app.use('/holdingOrgs', (new HoldingOrgController().getRouter()));
  app.use('/memberOrgs', (new MemberOrgController().getRouter()));
  app.use('/customers', (new CustomerController()).getRouter());

  app.use('/campaigns', (new CampaignController()).getRouter());
  app.use('/commCampaigns', (new CommCampaignController()).getRouter());
  app.use('/respCampaigns', (new RespCampaignController()).getRouter());
  app.use('/npsCampaigns', (new NpsCampaignController()).getRouter());

  app.use('/emailTemplates', (new EmailTemplateController()).getRouter());
  app.use('/messageTemplates', (new MessageTemplateController()).getRouter());

  app.use('/respTypes', (new RespTypeController()).getRouter());

  app.use('/npsSurveys', (new NpsSurveyController()).getRouter());
  app.use('/respSurveys', (new RespSurveyController()).getRouter());
  app.use('/npsSurveyComponents', (new NpsSurveyComponentController()).getRouter());
  app.use('/respSurveyComponents', (new RespSurveyComponentController()).getRouter());
  app.use('/npsSurveyInstances', (new NpsSurveyInstanceController()).getRouter());
  app.use('/respSurveyInstances', (new RespSurveyInstanceController()).getRouter());


  app.use('/messages', (new MessageController()).getRouter());
  app.use('/messageEvents', (new MessageEventController()).getRouter());

  app.use('/statics', (new StaticsController()).getRouter());
  app.use('/systemConfig', (new SystemConfigController()).getRouter());
  app.use('/systemConfig', (new SystemConfigController()).getRouter());

  app.use('/customerFileUpload', (new CustomerFileUploadController()).getRouter());

  /********** error handling **********/
  app.use(errorMiddleware.handleValidationError)
  app.use(errorMiddleware.handleAppError)
  app.use(errorMiddleware.handleError)
  app.use(errorMiddleware.notFound)

  return app;
  }catch(err){
    console.error(err);
    return null
  }
}
