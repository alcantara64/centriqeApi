/**
 * TODO: Potential improvement: add ability to handle input dates as strings. Right now, incoming UI requests need to be converted to mongoose models
 *
 */
import logger from "../loaders/winston.loader";
import { DateTime } from 'luxon';
import {
  DailySchedule,
  MonthlySchedule,
  WeeklySchedule,
  SchedulePattern,
  ScheduleType,
  ScheduleDayOfMonth,
  ScheduleWeekDay,
  ScheduleOccurence,
  YearlySchedule,
  CampaignDocument,
  CampaignVersionDocument
} from "../models/campaign/campaign.types";
import { TemplateScheduledMessageEvent } from '../models/message/message-event.types'
import AppException from "../exceptions/AppException";
import { MessageEventType } from "../models/message/message-event.types";


export default {
  generateScheduleEvents,
  generateSchedule
}

export const NO_END_DATE_ADD_YEARS: number = 5;


/**
 * Generates a series of message events
 * @param campaign
 */
function generateScheduleEvents(campaign: CampaignDocument, campaignVersion: CampaignVersionDocument): Array<TemplateScheduledMessageEvent> {
  logger.info(`lib.schedule:generateScheduleEvents::Generating message events for ${campaign._id}`);

  const dates = generateSchedule(campaign.schedulePattern);
  const messageEvents: Array<TemplateScheduledMessageEvent> = [];

  const now = new Date()

  for (let date of dates) {
    if (now < date) {
      messageEvents.push({
        date: date,
        eventType: MessageEventType.CAMPAIGN,
        campaign: campaign._id,
        campaignCode: campaign.code,
        campaignVersion: campaignVersion._id,
        dataDomain: campaign.dataDomain,
        holdingOrg: campaign.holdingOrg,
        memberOrg: campaign.memberOrg,
      });
    }
  }

  return messageEvents;
}



export function getNextJsWeekDay(weekDay: number) {
  return (weekDay + 1) % 7;
}

/**
 * This function converts from Luxon weekday to js Date weekday.
 * Luxon DateTime has 1 = Monday and 7 = Sunday where as js Date has 0 = Sunday and 6 = Saturday
 * @param weekDay
 */
export function convertLuxonWeekDayToJsWeekDay(weekDay: number) {
  return weekDay === 7 ? 0 : weekDay
}


/**
 * This function converts from js month to luxon month
 * js Date has 0 = January, Luxon has 1 = January
 * @param weekDay
 */
export function convertJsMonthToLuxonMonth(month: number) {
  return month + 1;
}



export function setDayOfMonth(date: DateTime, dayOfMonth: ScheduleDayOfMonth): DateTime {
  const lastDayOfMonth = <ScheduleDayOfMonth>date.endOf("month").day
  if (dayOfMonth > lastDayOfMonth) {
    dayOfMonth = lastDayOfMonth
  }
  return date.set({ day: dayOfMonth });
}

export function translateOcurrence(occurence: ScheduleOccurence, weekDay: ScheduleWeekDay, date: DateTime): DateTime | null {
  let workingDate = date.set({ day: 1 });
  let counter = 0;
  let desiredCounter = 0;

  switch (occurence) {
    case 'first': {
      desiredCounter = 1
      break;
    }
    case 'second': {
      desiredCounter = 2
      break;
    }
    case 'third': {
      desiredCounter = 3
      break;
    }
    case 'fourth': {
      desiredCounter = 4
      break;
    }
    case 'last': {
      desiredCounter = -1
      break;
    }
  }

  //this requires special treatment
  const isLastOccurenceMode = desiredCounter === -1;

  //result date can be null because the x-st number of friday may not be present in the month
  let resultDate: DateTime | null = null;
  //we will only run until the last day of the month. the caller will have to gives us a different month
  const lastDayOfMonth = workingDate.endOf("month").day;
  //the current day of the month
  let currentMonthDay = workingDate.day;
  //the current weekday. We need to convert between luxon weekday and js weekday
  let currentWeekDay = convertLuxonWeekDayToJsWeekDay(workingDate.weekday);

  while (true) { //loop indefinitely until break is reached

    if (weekDay == currentWeekDay) {
      //we found a weekday that matches, let's increase the counter
      counter++;

      if (counter === desiredCounter || isLastOccurenceMode) {
        resultDate = workingDate
        if (resultDate.diff(date, ['days']).days < 0) {
          //if the provided date is after the found date, we'll return null (nothing found)
          //can potentially be improved by breaking out already when we pass the provided date
          resultDate = null;
        }

        if (!isLastOccurenceMode) {
          //we will only break out if we are not in last occurence mode
          //in last occurence, we will have to run to the end of the month
          break;
        }
      }
    }

    if (currentMonthDay === lastDayOfMonth) {
      //that's it for this month; we'll break out
      break;
    }

    //prepare next round
    workingDate = workingDate.plus({ day: 1 });
    currentMonthDay = workingDate.day;
    currentWeekDay = convertLuxonWeekDayToJsWeekDay(workingDate.weekday);
  }

  return resultDate;
}


export const NextDateFn = {
  daily: generateNextDateForDailySchedule,
  weekly: generateNextDateForWeeklySchedule,
  monthly: generateNextDateForMonthlySchedule,
  yearly: generateNextDateForYearlySchedule
}


function generateNextDateForDailySchedule(schedule: DailySchedule, lastDate: DateTime | null): DateTime {
  const { dayRecurrenceCount } = schedule;

  let newDate: DateTime
  if (lastDate === null) {
    newDate = schedule.getStartDateInTimeZone();
  } else {
    newDate = lastDate.plus({ days: dayRecurrenceCount });
  }
  return newDate;
}

function generateNextDateForWeeklySchedule(schedule: WeeklySchedule, lastDate: DateTime | null): DateTime {
  const { dayOfWeek, weekRecurrenceCount } = schedule;
  let weekDay = 0;
  let wasDateFound = false;

  const startDateDt = schedule.getStartDateInTimeZone();

  let newDate: DateTime;
  if (lastDate === null) {
    //get first date that matches
    weekDay = convertLuxonWeekDayToJsWeekDay(startDateDt.weekday);
    newDate = startDateDt;
    while (!dayOfWeek[weekDay]) {
      weekDay = getNextJsWeekDay(weekDay);
      newDate = newDate.plus({ days: 1 });
    }
    wasDateFound = true;

  } else {
    const lastDateDt = lastDate;
    weekDay = getNextJsWeekDay(convertLuxonWeekDayToJsWeekDay(lastDateDt.weekday));
    newDate = lastDateDt.plus({ days: 1 });
  }

  while (!wasDateFound) {
    //no date determined yet; find first date
    while (weekDay <= 6 && !dayOfWeek[weekDay]) {
      weekDay++;
      newDate = newDate.plus({ days: 1 })
    }

    if (weekDay > 6 && !dayOfWeek[6]) {
      //go x weeks ahead
      newDate = newDate.plus({ weeks: weekRecurrenceCount });
      //jump to start of week
      newDate = newDate.minus({ days: 7 });
      weekDay = 0;
    } else {
      wasDateFound = true;
    }
  }

  return newDate;
}


function generateNextDateForMonthlySchedule(schedule: MonthlySchedule, lastDate: DateTime | null): DateTime {
  let date: DateTime
  if (schedule.byDayOfMonth && schedule.byDayOfMonth.dayOfMonth) { //additional check because of mongoose model
    date = generateNextDateForMonthlyScheduleByDayOfMonth(schedule, lastDate);
  }
  else if (schedule.byWeekDay && schedule.byWeekDay.monthRecurrenceCount) { //additional check because of mongoose model
    date = generateNextDateForMonthlyScheduleByWeekDay(schedule, lastDate);
  }
  else {
    throw new AppException("Unknown monthly schedule type");
  }
  return date;
}

function generateNextDateForMonthlyScheduleByDayOfMonth(schedule: MonthlySchedule, lastDate: DateTime | null): DateTime {
  const { byDayOfMonth } = schedule;

  if (!byDayOfMonth) {
    throw new AppException("byDayOfMonth needs to exist");
  }
  const { dayOfMonth, monthRecurrenceCount } = byDayOfMonth;

  let newDate: DateTime;

  if (lastDate === null) {
    newDate = schedule.getStartDateInTimeZone();

    if (newDate.day <= dayOfMonth) {
      newDate = setDayOfMonth(newDate, dayOfMonth);
    } else {
      newDate = setDayOfMonth(newDate.plus({ months: 1 }), dayOfMonth);
    }

  } else {
    newDate = setDayOfMonth(lastDate.plus({ months: monthRecurrenceCount }), dayOfMonth);
  }

  return newDate;
}


function generateNextDateForMonthlyScheduleByWeekDay(schedule: MonthlySchedule, lastDate: DateTime | null): DateTime {
  const { byWeekDay } = schedule;

  if (!byWeekDay) {
    throw new AppException("byDayOfMonth needs to exist");
  }
  const { monthRecurrenceCount, occurence, weekDay } = byWeekDay;

  let addMonths = 0;
  let date: DateTime;
  if (lastDate === null) {
    date = schedule.getStartDateInTimeZone();
    addMonths = 1;
  } else {
    date = lastDate.set({ day: 1 }).plus({ month: monthRecurrenceCount });
    addMonths = monthRecurrenceCount;
  }
  let resultDate: DateTime | null = null;

  do {
    resultDate = translateOcurrence(occurence, weekDay, date);
    date = date.plus({ months: addMonths });
  } while (resultDate === null)

  return resultDate;
}

function generateNextDateForYearlySchedule(schedule: YearlySchedule, lastDate: DateTime | null): DateTime {
  let date: DateTime
  if (schedule.byMonthDay && schedule.byMonthDay.day) { //additional check because of mongoose model
    date = generateNextDateForYearlyScheduleByMonthDay(schedule, lastDate);
  }
  else if (schedule.byMonthWeekDay && schedule.byMonthWeekDay.month >= 0) { //additional check because of mongoose model
    date = generateNextDateForYearlyScheduleByMonthWeekDay(schedule, lastDate);
  }
  else {
    throw new AppException("Unknown yearly schedule type");
  }
  return date;
}


function generateNextDateForYearlyScheduleByMonthDay(schedule: YearlySchedule, lastDate: DateTime | null): DateTime {
  const { byMonthDay, yearRecurrenceCount } = schedule;

  if (!byMonthDay) {
    throw new AppException("byMonthDay needs to exist");
  }
  const { day, month } = byMonthDay;
  const luxonMonth = convertJsMonthToLuxonMonth(month);

  let addYears = 0;
  let date: DateTime;
  if (lastDate === null) {
    date = schedule.getStartDateInTimeZone();
    date = date.set({ month: luxonMonth })
    date = setDayOfMonth(date, day);

    const luxonStartDate = schedule.getStartDateInTimeZone();
    if (luxonStartDate.diff(date, ['days']).days > 0) {
      addYears = 1;
    } else {
      addYears = 0;
    }

  } else {
    date = lastDate;
    addYears = yearRecurrenceCount;
  }

  date = date.plus({ years: addYears });
  //due to leap year
  date = setDayOfMonth(date, day);
  return date;
}

function generateNextDateForYearlyScheduleByMonthWeekDay(schedule: YearlySchedule, lastDate: DateTime | null): DateTime {

  const { yearRecurrenceCount, byMonthWeekDay } = schedule;

  if (!byMonthWeekDay) {
    throw new AppException("byMonthWeekDay needs to exist");
  }
  const { month, occurence, weekDay } = byMonthWeekDay;

  let addYears = 0;
  let date: DateTime;
  if (lastDate === null) {
    date = schedule.getStartDateInTimeZone();
    date = date.set({ month: convertJsMonthToLuxonMonth(month), day: 1 });

    addYears = 1;
  } else {
    date = lastDate.set({ day: 1 }).plus({ year: yearRecurrenceCount });
    addYears = yearRecurrenceCount;
  }
  let resultDate: DateTime | null = null;

  const luxonStartDate = schedule.getStartDateInTimeZone();
  do {
    resultDate = translateOcurrence(occurence, weekDay, date);
    if (resultDate && luxonStartDate.diff(resultDate, ['days']).days > 0) {
      resultDate = null;
    }
    date = date.plus({ years: addYears });
  } while (resultDate === null)

  return resultDate;
}

/**
 * Generates a series of dates that can be used in a message event document
 * @param schedulePattern This needs to be a properly set up object, meaning date fields need to be of type "Date".
 * If data comes from UI, convert to mongoose model first.
 */
export function generateSchedule(schedulePattern: SchedulePattern): Array<Date> {

  const dates: Array<Date> = [];

  if (schedulePattern.scheduleType === ScheduleType.ONE_TIME) {
    dates.push(schedulePattern.getStartDateInTimeZone().toJSDate());
  } else {
    const endDate = determineEndDate(schedulePattern);
    const nextDateFn = (<any>NextDateFn)[schedulePattern.scheduleType]

    let newDate: DateTime | null = null;

    let occurenceCount = 1;
    while (
      (schedulePattern.endAfterOccurrenceCount && occurenceCount <= schedulePattern.endAfterOccurrenceCount)
      || !newDate || (endDate && newDate <= endDate)
    ) {
      //const newDateTime: DateTime | null = newDate ? DateTime.fromJSDate(newDate) : null
      newDate = nextDateFn(schedulePattern, newDate);

      if (newDate && (!endDate || (endDate && newDate <= endDate))) {
        //this check needs to be done, because we didnt check the newly generated date yet
        dates.push(newDate.toJSDate());
      }

      occurenceCount++;
    }

  }

  dates
  return dates;
}


export function determineEndDate(schedulePattern: SchedulePattern): DateTime | null {
  let endDate: DateTime | null = null;
  let endDateInTimezone = schedulePattern.getEndDateInTimeZone();

  if (schedulePattern.scheduleType === ScheduleType.ONE_TIME) {
    return null;
  }
  else {
    if (schedulePattern.endDate == null && schedulePattern.endAfterOccurrenceCount == null) {
      endDate = schedulePattern.getStartDateInTimeZone().plus({ years: NO_END_DATE_ADD_YEARS });
    }
    else if (endDateInTimezone) {
      endDate = endDateInTimezone;
    }
  }
  return endDate;
}



