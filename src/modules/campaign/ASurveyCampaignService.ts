/**
 * 2021-01-12 - Frank - There is no reason to have this anymore. However, keeping it still. There may be some nps/ resp
 * specific implemenations that can land in here -- then they can be used for both implementing classes.
 */


import { NpsCampaignDocument, RespCampaignDocument } from 'src/models/campaign/campaign.types';
import DataDomain from '../../enums/DataDomain';
import AppUser from '../../interfaces/models/AppUser';
import { IGrantingPrivileges } from '../../interfaces/services/ACrudService';
import ICrudService from '../../interfaces/services/ICrudService';
import IServiceBase from '../../interfaces/services/IServiceBase';
import logger from '../../lib/logger';
import NpsSurveyService from '../survey/NpsSurveyService';
import RespSurveyService from '../survey/RespSurveyService';
import ACampaignService from './ACampaignService';


class ASurveyCampaignService extends ACampaignService implements IServiceBase, ICrudService {
  protected surveyService

  constructor(loggerString: string, grantingPrivileges: IGrantingPrivileges, dataDomain: DataDomain, surveyService: NpsSurveyService | RespSurveyService) {
    super(
      loggerString,
      grantingPrivileges,
      dataDomain
    );
    this.surveyService = surveyService
  }

  protected getMongooseQueryPopulateOptions(methodName: "readOneById" | "readMany"): string | null | Array<Object> {
    const opts = [
      { path: 'survey', select:'_id code name displayName' },
    ];

    return opts;
  }

  protected async beforeCreateOne(appUser: AppUser, payload: any): Promise<void> {
    logger.debug(`${this.loggerString}:beforeCreateOne::Switching to latest survey version`);
    await this.switchSurveyToLatestVersion(payload);
  }


  // after create, the survey version is fixed for that campaign
  // protected async afterUpdateOne(appUser: AppUser, updatedModel: any, id: string, payload: any): Promise<void> {
  //   logger.debug(`${this.loggerString}:afterUpdateOne::Saving history document for ${id}`);
  //   await this.switchSurveyToLatestVersion(updatedModel);
  //   await super.afterUpdateOne(appUser, updatedModel, id, payload);
  // }

  private async switchSurveyToLatestVersion(payload: NpsCampaignDocument | RespCampaignDocument): Promise<void> {
    const survey = payload.survey;
    logger.debug(`${this.loggerString}:switchSurveyToLatestVersion::Switching to latest survey version id - surveyId ${survey}`);
    const latestVersion = await this.surveyService.getLatestVersionLean(survey)
    payload.surveyVersion = latestVersion._id.toString();
    payload.surveyCode = latestVersion.code;

    console.log(payload.survey);
  }


  protected getFieldNamesForSearch() {
    return ['memberOrg', 'holdingOrg'];
  }
}

export default ASurveyCampaignService
