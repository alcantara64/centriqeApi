import mongoose from 'mongoose';
import { SurveyVersionSchema } from './survey.model';
import { SurveyVersionDocument } from './survey.types';


const ServeyVersionModel = mongoose.model<SurveyVersionDocument>('SurveyVersion', SurveyVersionSchema);

export default ServeyVersionModel;
