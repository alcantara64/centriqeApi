import { Request, Response, Router } from 'express';
import IControllerBase from '../../interfaces/controllers/IControllerBase';
import ICrudController from '../../interfaces/controllers/ICrudController';
import ACampaignController from './ACampaignController';
import ACampaignService from './ACampaignService';
import logger from '../../lib/logger';
import ASurveyInstanceService from '../survey-instance/ASurveyInstanceService';
import DataDomain from '../../enums/DataDomain';


class ASurveyCampaignController extends ACampaignController implements IControllerBase, ICrudController {

  constructor(campaignService: ACampaignService, loggerString: string, protected surveyInstanceService: ASurveyInstanceService, dataDomain: DataDomain) {
    super(
      campaignService,
      loggerString,
      dataDomain
    );
  }

  addRoutesBeforeStandardRoutes(router: Router): void {
    super.addRoutesBeforeStandardRoutes(router)
    /**Ritesh - 2021-02-05 */
    router.post('/surveyResults', (req: Request, res: Response) => { return this.surveyResults(req, res) });
  }

  /**Ritesh - 2021-02-05 */
  public async surveyResults(req: Request, res: Response): Promise<any> {
    logger.debug(`${this.loggerString}:surveyResults::Start for campaign`)
    const surveysummaryinput = req.body;

    //const campaingId = req.params.campaignId;
    const appUser = this.extractAppUser(req);
    const surveyresults = await this.surveyInstanceService.surveySummaryReport(appUser,surveysummaryinput);
    return res.send(surveyresults);
  }

}


export default ASurveyCampaignController
