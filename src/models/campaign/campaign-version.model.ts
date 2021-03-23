import mongoose from 'mongoose';
import DataDomain from '../../enums/DataDomain';
import { CampaignVersionSchema, CommCampaignSchema, NpsCampaignSchema, RespCampaignSchema } from './campaign.model';
import { CampaignVersionDocument } from './campaign.types';


CampaignVersionSchema.index({ code: 1, memberOrg: 1, holdingOrg: 1 })
const CampaignVersionModel = mongoose.model<CampaignVersionDocument>('CampaignVersion', CampaignVersionSchema);

CampaignVersionModel.discriminator("CommCampaignVersion", CommCampaignSchema, DataDomain.COMM);
CampaignVersionModel.discriminator("NpsCampaignVersion", NpsCampaignSchema, DataDomain.NPS);
CampaignVersionModel.discriminator("RespCampaignVersion", RespCampaignSchema, DataDomain.RESP);


export default CampaignVersionModel;
