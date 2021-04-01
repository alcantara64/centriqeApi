import ACrudService, { IGrantingPrivileges } from '../../interfaces/services/ACrudService';
import IServiceBase from '../../interfaces/services/IServiceBase';
import ICrudService from '../../interfaces/services/ICrudService';

import CampaignModel from '../../models/campaign/campaign.model';
import DataDomain from '../../enums/DataDomain';
import AppUser from '../../interfaces/models/AppUser';
import { CampaignDocument, SchedulePattern, ScheduleType, CampaignVersion } from '../../models/campaign/campaign.types';
import CampaignVersionModel from '../../models/campaign/campaign-version.model';
import MessageEventModel from '../../models/message/message-event.model';
import logger from '../../lib/logger'
import ModelStatus from '../../enums/ModelStatus';
import { MessageEventStatus } from '../../models/message/message-event.types';
import scheduleUtil from '../../lib/schedule.util';
import mongoose from 'mongoose';

abstract class ACampaignService extends ACrudService implements IServiceBase, ICrudService {

  constructor(loggerString: string, grantingPrivileges: IGrantingPrivileges, dataDomain: DataDomain) {
    super(
      CampaignModel,
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
    await this.saveHistoryAndGenerateEvents(<CampaignDocument>newModel);
  }


  protected async afterUpdateOne(appUser: AppUser, updatedModel: any, id: string, payload: any): Promise<void> {
    logger.debug(`${this.loggerString}:afterUpdateOne::Saving history document for ${id}`);
    await this.saveHistoryAndGenerateEvents(<CampaignDocument>updatedModel);
  }

  protected async beforeDeleteOne(appUser: AppUser, id: string): Promise<void> {
    logger.debug(`${this.loggerString}:beforeDeleteOne::Deleting old events ${id}`);

    await MessageEventModel.deleteMany({ campaign: new mongoose.Types.ObjectId(id), status: MessageEventStatus.PENDING })
  }

  private async saveHistoryAndGenerateEvents(campaign: CampaignDocument) {
    //get all active version models
    const { _id } = campaign;
    const campaignVersions = await CampaignVersionModel.find({ originalId: _id, status: ModelStatus.ACTIVE });

    //set all inactive
    for (let campaignVersion of campaignVersions) {
      campaignVersion.status = ModelStatus.INACTIVE;
      await campaignVersion.save({ validateBeforeSave: false })

      //delete all non-processed events
      //going with actual campaign not campaign version. this will do a proper clean-up in case anything went wrong in between
      await MessageEventModel.deleteMany({ campaign: campaign._id, status: MessageEventStatus.PENDING })

      //does this campaign version have any events left?
      const campaignEventCount = await MessageEventModel.countDocuments({ campaignVersion: campaignVersion._id })
      if (campaignEventCount === 0) {
        //if there are no events for this campaign left, just delete the version
        await campaignVersion.deleteOne();
      }
    }

    //add new version
    const jsonModel = campaign.toJSON() as any
    (<CampaignVersion>jsonModel).originalId = jsonModel._id;
    delete jsonModel._id;
    const versionModel = new CampaignVersionModel(jsonModel)
    await versionModel.save({ validateBeforeSave: false });

    //insert new events only if campaign is active
    if (campaign.status === ModelStatus.ACTIVE) {
      const messageEvents = scheduleUtil.generateScheduleEvents(campaign, versionModel);
      await MessageEventModel.insertMany(messageEvents);
      let totalEvents = messageEvents.length
      if(totalEvents > 0)
      {
        let lastEventDate:Date = messageEvents[0].date
        for(let messageEvent of messageEvents)
        {
            if(lastEventDate < messageEvent.date)
            {
              lastEventDate = messageEvent.date
            }
        }
        campaign.totalEvents = totalEvents
        campaign.lastEventDate = lastEventDate
      }
    }

  }


  public async generateDateSchedule(schedulePattern: SchedulePattern): Promise<any> {
    if (schedulePattern.scheduleType !== ScheduleType.ONE_TIME
      && !schedulePattern.endAfterOccurrenceCount && !schedulePattern.endDate) {
      schedulePattern.endAfterOccurrenceCount = 24;
    }

    //converting to model because the dates need to be actual dates
    const model = new CampaignModel({ schedulePattern: schedulePattern });
    const dates = scheduleUtil.generateSchedule(model.schedulePattern);
    return dates;
  }

}

export default ACampaignService
