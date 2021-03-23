import { Document, Model } from "mongoose";
import { MessageChannel } from "../../models/message/message.types";
import ModelStatus from "../../enums/ModelStatus";
import DataDomain from "../../enums/DataDomain";
import { DateTime } from "luxon";


export type ScheduleDayOfMonth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31
export type ScheduleOccurence = 'first' | 'second' | 'third' | 'fourth' | 'last';
export type ScheduleWeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6
export type ScheduleMonth = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

//TODO: convert to enum
export type Operator =  "=" | "<>" | "!=" | ">" | "<" | "<=" | ">=" |  
                        "in list" | "not in list" | "In List" | "Not In List" |   
                        "days before" | "Days Before" | "days after" | "Days After" | "days after (no year)" | "days before (no year)" | 
                        "contains" | "Contains"| "Does not contain" | "does not contain" | 
                        "Is populated" | "is populated" | "Is not populated" | "is not populated";

export type LogicalConcatenator = 'and' | 'or' | '' | null | 'AND' | 'OR'

export enum ScheduleType {
  ONE_TIME = 'oneTime',
  DAILY = 'daily',
  WEEKY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export interface Campaign {
  dataDomain: DataDomain;
  holdingOrg?: string;
  memberOrg?: string;
  code: string;
  name: string;
  description: string;
  channel: MessageChannel,
  filter: CampaignFilter,
  schedulePattern: SchedulePattern,
  status: ModelStatus
}
export interface CampaignDocument extends Campaign, Document { }
export interface CampaignModel extends Model<CampaignDocument> { }


export interface CampaignVersion extends Campaign {
  originalId: string;
}
export interface CampaignVersionDocument extends CampaignVersion, Document { }
export interface CampaignVersionModel extends Model<CampaignVersionDocument> { }

export interface CommCampaign extends Campaign {
  readonly dataDomain: DataDomain.COMM;
  template: string;
}
export interface CommCampaignDocument extends CommCampaign, Document { }

export interface RespCampaign extends Campaign {
  readonly dataDomain: DataDomain.RESP;
  survey: string;
  surveyCode: string;
  surveyVersion: string;
}
export interface RespCampaignDocument extends RespCampaign, Document { }

export interface NpsCampaign extends Campaign {
  readonly dataDomain: DataDomain.NPS;
  survey: string;
  surveyCode: string;
  surveyVersion: string;
}
export interface NpsCampaignDocument extends NpsCampaign, Document { }

export interface CampaignFilter {
  holdingOrg?: string;
  memberOrg?: string;
  criteria: FilterCriteria;
  query: string;
}

export interface FilterCriterion {
  rowNumber: number;
  holdingOrg?: string;
  memberOrg?: string;
  startParenthesisCount: number;
  endParenthesisCount: number;
  attributeName: string;
  operator: Operator,
  values: Array<any>,
  logicalConcatenation: LogicalConcatenator
}
export interface FilterCriteria extends Array<FilterCriterion> { }


export type SchedulePattern = OneTimeSchedule | DailySchedule | WeeklySchedule | MonthlySchedule | YearlySchedule

export interface SchedulePatternWithRunDuration {
  timeZone: string;
  startDate: Date;
  sendTime: string,
  endDate?: Date;
  endAfterOccurrenceCount?: number;

  getStartDateInTimeZone: (this: SchedulePatternWithRunDuration, includeTime?: boolean) => DateTime;
  getEndDateInTimeZone: (this: SchedulePatternWithRunDuration, includeTime?: boolean) => DateTime | undefined;
}


export interface OneTimeSchedule extends SchedulePatternWithRunDuration {
  readonly scheduleType: ScheduleType.ONE_TIME
}


export interface DailySchedule extends SchedulePatternWithRunDuration {
  readonly scheduleType: ScheduleType.DAILY;
  dayRecurrenceCount: number;
}

export interface WeeklySchedule extends SchedulePatternWithRunDuration {
  readonly scheduleType: ScheduleType.WEEKY;
  weekRecurrenceCount: number;
  dayOfWeek: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
}

export interface MonthlySchedule extends SchedulePatternWithRunDuration {
  readonly scheduleType: ScheduleType.MONTHLY;
  byDayOfMonth?: {
    dayOfMonth: ScheduleDayOfMonth;
    monthRecurrenceCount: number;
  }

  byWeekDay?: {
    occurence: ScheduleOccurence,
    weekDay: ScheduleWeekDay,
    monthRecurrenceCount: number
  }
}


export interface YearlySchedule extends SchedulePatternWithRunDuration {
  readonly scheduleType: ScheduleType.YEARLY;
  yearRecurrenceCount: number,

  byMonthDay?: {
    month: ScheduleMonth;
    day: ScheduleDayOfMonth
  }

  byMonthWeekDay?: {
    occurence: ScheduleOccurence,
    weekDay: ScheduleWeekDay,
    month: ScheduleMonth
  }
}
