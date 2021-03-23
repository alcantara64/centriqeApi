import DataDomain from '../../enums/DataDomain';
import ACrudService, { IGrantingPrivileges } from '../../interfaces/services/ACrudService';
import ICrudService from '../../interfaces/services/ICrudService';
import IServiceBase from '../../interfaces/services/IServiceBase';
import SurveyModel from '../../models/resp/survey.model';
import SurveyVersionModel from '../../models/resp/survey-version.model';
import logger from '../../lib/logger'
import { SurveyVersion, SurveyDocument, SurveyVersionDocument } from '../../models/resp/survey.types';
import AppUser from '../../interfaces/models/AppUser';
import AppException from '../../exceptions/AppException';


abstract class ASurveyService extends ACrudService implements IServiceBase, ICrudService {

  constructor(loggerString: string, grantingPrivileges: IGrantingPrivileges, dataDomain: DataDomain) {
    super(
      SurveyModel,
      loggerString,
      grantingPrivileges,
      dataDomain
    );
  }

  restrictModelByDataDomain(): boolean {
    return true;
  }

  protected async afterCreateOne(appUser: AppUser, newModel: any, payload: any): Promise<void> {
    logger.debug(`${this.loggerString}:afterCreateOne::Saving history document`);
    await this.saveVersion(<SurveyDocument>newModel);
  }


  protected async afterUpdateOne(appUser: AppUser, updatedModel: any, id: string, payload: any): Promise<void> {
    logger.debug(`${this.loggerString}:afterUpdateOne::Saving history document for ${id}`);
    await this.saveVersion(<SurveyDocument>updatedModel);
  }


  private async saveVersion(model: SurveyDocument): Promise<void> {
    //add new version
    const jsonModel = model.toJSON() as any
    (<SurveyVersion>jsonModel).originalId = jsonModel._id
    delete jsonModel._id
    const versionModel = new SurveyVersionModel(jsonModel)
    await versionModel.save({ validateBeforeSave: false });
  }

  public async getLatestVersionLean(surveyId: string): Promise<SurveyVersionDocument> {
    const doc = await SurveyVersionModel.find({ originalId: surveyId })
      .sort({ _id: -1 })
      .limit(1)
      .lean()

    if (!doc || doc.length === 0) {
      //this should never happen; we always store a new version with a survey
      const errorMsg = `There are no survey versions for original surveyId ${surveyId}`
      logger.error(`${this.loggerString}:afterUpdateOne::${errorMsg}`);
      throw new AppException(errorMsg)
    }
    return <SurveyVersionDocument>doc[0];
  }

  protected getMongooseQueryPopulateOptions(methodName: "readOneById" | "readMany"): string | null | Array<Object> {
    const opts = [
      { path: 'holdingOrg', select: "_id name logoUrl" },
      { path: 'memberOrg', select: "_id name", populate: { path: 'holdingOrg', select: '_id name logoUrl' } }
    ];

    return opts;
  }
}

export default ASurveyService
