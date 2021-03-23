import { DateTime } from "luxon";
import { SchedulePatternWithRunDuration } from "./campaign.types";



/**
 * Generates a DateTime object with the specified timezone.
 * @param this
 * @param includeTime By default, includes the sendTime
 */
export function getStartDateInTimeZone(this: SchedulePatternWithRunDuration, includeTime = true): DateTime {
  let date: DateTime

  if (includeTime) {
    date = getDateTimeInTimeZone(this.startDate, this.timeZone, this.sendTime);
  } else {
    date = getDateTimeInTimeZone(this.startDate, this.timeZone);
  }
  return date;
}

/**
 * Generates a DateTime object with the specified timezone.
 * @param this
 * @param includeTime By default, includes the sendTime
 */
export function getEndDateInTimeZone(this: SchedulePatternWithRunDuration, includeTime = true): DateTime | undefined {
  let date: DateTime | undefined

  if (includeTime) {
    date = this.endDate ? getDateTimeInTimeZone(this.endDate, this.timeZone, this.sendTime) : undefined;
  } else {
    date = this.endDate ? getDateTimeInTimeZone(this.endDate, this.timeZone) : undefined;
  }
  return date;
}

/**
 *
 * @param jsDate A javascript Date
 * @param timeZone The timezone it should be converted into
 * @param time The time in 24 hour format (23:11)
 */
export function getDateTimeInTimeZone(jsDate: Date, timeZone: string, time?: string): DateTime {
  let localDate: DateTime;

  if (time !== undefined) {
    //assuming that time always comes in 24h format. For example "23:10"
    const hour = Number(time.substring(0, 2));
    const minute = Number(time.substring(3, 5));

    //generating new startDate including hour and minute in the correct timezone.
    localDate = DateTime.fromJSDate(jsDate).setZone(timeZone).set({ hour: hour, minute: minute });
  } else {
    localDate = DateTime.fromJSDate(jsDate).setZone(timeZone);
  }

  return localDate;
}
