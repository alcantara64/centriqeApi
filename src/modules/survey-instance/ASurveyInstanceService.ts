import { addUtcIdentifierToDateString } from '../../lib/date.util';
import AppUser from '../../interfaces/models/AppUser';
import DataDomain from '../../enums/DataDomain';
import ACrudService, { IGrantingPrivileges } from '../../interfaces/services/ACrudService';
import ICrudService from '../../interfaces/services/ICrudService';
import IServiceBase from '../../interfaces/services/IServiceBase';
import SurveyInstanceModel from '../../models/resp/survey-instance.model';
import ASurveyService from '../survey/ASurveyService';
import { ObjectId } from 'mongodb';

abstract class ASurveyInstanceService extends ACrudService implements IServiceBase, ICrudService {

  constructor(loggerString: string, grantingPrivileges: IGrantingPrivileges, dataDomain: DataDomain, protected surveyService: ASurveyService) {
    super(
      SurveyInstanceModel,
      loggerString,
      grantingPrivileges,
      dataDomain
    );
  }

  /**Ritesh - 2021-02-05 */
  /**
   * @param AppUser
   * @param campaignId
   * @param Start and End date --> Need to incorporate
   * Process :
   *    1. Collec1 the Survey Verison Data based on the campaignId Provided
   *    2. Collect the Submission status data
   *    3. Collect the response Feedback consolidated values based on the questionType
   */
  public async surveySummaryReport(appUser: AppUser,  surveysummaryinput: surveySummaryInput): Promise<any> {

    var campaignId = surveysummaryinput.campaignId;
    var filterquery : any;
    if(campaignId === undefined)
    {
      filterquery = {'$match': {'messageEvent': new ObjectId(surveysummaryinput.messageEventId)}};
    }
    else
    {
      const luxon_1 = require("luxon");
      var startDate:Date
      startDate = new Date(addUtcIdentifierToDateString(surveysummaryinput.startDate))
      startDate = luxon_1.DateTime.fromJSDate(startDate).set({ hour: 0, minute: 0, second:0 })
      
      var endDate:Date
      endDate = new Date(addUtcIdentifierToDateString(surveysummaryinput.endDate))
      endDate = luxon_1.DateTime.fromJSDate(endDate).set({ hour: 0, minute: 0, second:0 }).plus({days:1})

      filterquery = {'$match': {
                                  'campaign': new ObjectId(surveysummaryinput.campaignId),
                                  'updatedAt': {$gte: startDate, $lte:endDate }
                               }
                    }
    }

    let reportData: any = {"surveyVersion": {}, "submissionStatus": {},"responses": {}};

    //Submission Status Query -- pending - In-Progress- Submitted - expired
    var submitDataQuery:any=[];
    submitDataQuery.push(filterquery);
    submitDataQuery.push({'$group': {'_id': {'campaign': '$campaign','survey': '$survey',
                                            'status': '$submissionStatus'},'hits': {'$sum': 1}}}, {
                          '$group': {'_id': {'campaign': '$_id.campaign','survey': '$_id.survey'},'response': {
                                              '$push': {'submissionStatus': '$_id.status', 'hits': '$hits'}}}}, {
                          '$project': {'_id': 0,'campaign': '$_id.campaign', 'survey': '$_id.survey',
                                        'response': '$response'}})
                                           
    var selectedResponseQuery:any=[];
    selectedResponseQuery.push(filterquery);
    selectedResponseQuery.push( {'$unwind': {'path': '$feedback'}}, 
                                {'$match' : {$and: [{'feedback.questionType': {$in: ['single-choice-radio-box','rating-star',
                                                                                      'rating-emoji','single-choice-radio-horizontal',
                                                                                      'drop-down-selection','likert-radio',
                                                                                      'likert-check','multi-choice-check-horizontal',
                                                                                      'matrix-check',
                                                                                      'matrix-radio']}}, 
                                                      {submissionStatus:"submitted"}]}}, 
                                {'$unwind': {'path': '$feedback.response'}}, 
                                {'$unwind': {'path': '$feedback.response.selected_value'}}, 
                                {'$group' : {'_id': {'questionId': '$feedback.questionId','questionType': '$feedback.questionType',
                                                    'providedOptions': '$feedback.providedOptions','selected_valueY': '$feedback.response.responseId', 
                                                    'selected_valueX': '$feedback.response.selected_value'},
                                                    'hits': {'$sum': 1}}}, 
                                {'$group' : {'_id': {'questionId': '$_id.questionId','questionType': '$_id.questionType', 
                                                    'providedOptions': '$_id.providedOptions'},'response': {'$push': {
                                                    'responseId': '$_id.selected_valueY','selectedValue': '$_id.selected_valueX',
                                                    'hits': '$hits'}}}}, 
                                {'$project' :{'_id': 0,'questionId': '$_id.questionId','questionType': '$_id.questionType', 
                                              'providedOptions': '$_id.providedOptions','totalResponses': { $toInt: "0" },
                                              'response': '$response',"textHitsResponse":[{"totalTextHits": {$toInt: "0"} }]}}
                              )

    var textResponseQuery:any=[];
    textResponseQuery.push(filterquery);
    textResponseQuery.push( {'$unwind': {'path': '$feedback'}},
                            {'$match' : {$and: [{'feedback.questionType': {$in: ['single-text-input','single-text-area']}}, 
                                                {submissionStatus:"submitted"}]}}, 
                            {'$group': {'_id': {'questionId': '$feedback.questionId','questionType': '$feedback.questionType',
                                'providedOptions': '$feedback.providedOptions'},'hits': {'$sum': 1}}},
                            {'$group': {'_id': {'questionId': '$_id.questionId','questionType': '$_id.questionType',
                                                'providedOptions': '$_id.providedOptions'},
                                                'response': {'$push': {'hits': '$hits'}}}},
                            {'$project': {'_id': 0,'questionId': '$_id.questionId', 'questionType': '$_id.questionType',
                                'providedOptions': '$_id.providedOptions', 
                                'totalResponses': { $toInt: "0" },'response': '$response'}}
                          )
    
    var additionalTextQuery:any=[];
    additionalTextQuery.push(filterquery);
    additionalTextQuery.push( {'$unwind': {'path': '$feedback'}}, 
                              {'$match' : {$and: [{'feedback.questionType': {$in: ['single-choice-radio-box','rating-star',
                                                                                'rating-emoji','single-choice-radio-horizontal',
                                                                                'drop-down-selection','likert-radio',
                                                                                'likert-check','multi-choice-check-horizontal',
                                                                                'matrix-check',
                                                                                'matrix-radio']}}, 
                                                  {submissionStatus:"submitted"}]}}, 
                              {'$unwind': {'path': '$feedback.response'}}, 
                              {'$match':  {'feedback.response.additional_text': {'$exists': true},
                                        '$expr': {'$gt': [{'$strLenCP': '$feedback.response.additional_text'}, 0]}}}, 
                              {'$group':  {'_id': {'questionId': '$feedback.questionId','questionType': '$feedback.questionType', 
                                        'responseId': '$feedback.response.responseId'},'texthits': {'$sum': 1}}}, 
                              {'$group':  {'_id': {'questionId': '$_id.questionId','questionType': '$_id.questionType'}, 
                                        'textHitResponse': {'$push': {'responseId': '$_id.responseId','totalTextHits': '$texthits'}}}}, 
                              {'$project': {'_id': 0,'questionId': '$_id.questionId','questionType': '$_id.questionType',
                                            'textHitsResponse': '$textHitResponse'}}
                            )
    
    //Getting Submission Status Summary based on CampaignId
    const submitData: any = await this.model.aggregate(submitDataQuery)
    //Getting Survey based on CampaignId
    if(submitData.length > 0)
    {

      const survey = submitData[0].survey.toString()
      const surveyVersionData: any = await this.surveyService.readOneById(appUser,survey)
      //Getting Response Summary based on CampaignId
      const selectedResponseData = await this.model.aggregate(selectedResponseQuery);
      const textResponseData = await this.model.aggregate(textResponseQuery);
      const additionalTextData = await this.model.aggregate(additionalTextQuery);

      if(surveyVersionData)
      {
        reportData.surveyVersion = surveyVersionData
      }

      if(submitData[0].response)
      {
        reportData.submissionStatus = submitData[0].response
      }


      if(selectedResponseData)
      {
        for (var i = 0,len = selectedResponseData.length; i < len; i++) {
          for (var j = 0, jlen = additionalTextData.length; j < jlen; j++) {
              if(selectedResponseData[i].questionId == additionalTextData[j].questionId)
              {
                selectedResponseData[i].textHitsResponse = additionalTextData[j].textHitsResponse;
              }
          }
        }
      }

      if(selectedResponseData)
      {
        for (var i = 0,len = selectedResponseData.length; i < len; i++) {
          for (var j = 0,  totalResponses = 0, rlen = selectedResponseData[i].response.length; j < rlen; j++) {
              totalResponses += selectedResponseData[i].response[j].hits
            }
            selectedResponseData[i].totalResponses = totalResponses
          }
        reportData.responses = selectedResponseData
      }

      if(textResponseData)
      {
        for (var i = 0,len = textResponseData.length; i < len; i++) {
          for (var j = 0,  totalResponses = 0, rlen = textResponseData[i].response.length; j < rlen; j++) {
              totalResponses += textResponseData[i].response[j].hits
            }
            textResponseData[i].totalResponses = totalResponses
            reportData.responses.push(textResponseData[i])
          }
      }
    }  
    return reportData;
  }

  restrictModelByDataDomain(): boolean {
    return true;
  }
}

export default ASurveyInstanceService

/** Defining Survey Summary  type*/
export type surveySummaryInput = {
  campaignId : string,
  messageEventId : string,
  startDate : string,
  endDate : string,
  timeZone : string;
}

