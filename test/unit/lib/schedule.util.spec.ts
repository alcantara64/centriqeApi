import { expect } from 'chai';
import 'mocha';
import { SchedulePattern, ScheduleType } from "../../../src/models/campaign/campaign.types";
import { generateSchedule } from '../../../src/lib/schedule.util';
import { getStartDateInTimeZone, getEndDateInTimeZone } from '../../../src/models/campaign/campaign.methods'
import { DateTime } from 'luxon'



const TEST_TIME_ZONE = "Europe/Berlin"

function getDate(year: number, month: number, day: number, hour: number, minute: number) {
  const date = DateTime.fromObject({ year, month, day, hour, minute }).setZone(TEST_TIME_ZONE, { keepLocalTime: true });
  return date.toJSDate()
}

function checkGenerateScheduleDates(schedulePattern: SchedulePattern, expectedResult: any) {
  const result = generateSchedule(schedulePattern);

  expect(result).to.deep.equal(expectedResult);
}

describe('schedule.util', function () {


  describe('generateOneTimeScheduleDates', function () {

    it('should test oneTime', function () {

      checkGenerateScheduleDates(
        {
          scheduleType: ScheduleType.ONE_TIME,
          timeZone: TEST_TIME_ZONE,
          sendTime: "10:35",
          startDate: getDate(2020, 12, 1, 0, 0),
          getStartDateInTimeZone: getStartDateInTimeZone,
          getEndDateInTimeZone: getEndDateInTimeZone
        },
        [getDate(2020, 12, 1, 10, 35)]
      );
    });


    it('should daily schedule with end after occurence count', function () {

      checkGenerateScheduleDates(
        {
          scheduleType: ScheduleType.DAILY,
          timeZone: TEST_TIME_ZONE,
          sendTime: "10:35",
          startDate: getDate(2020, 12, 1, 0, 0),
          endAfterOccurrenceCount: 5,
          dayRecurrenceCount: 2,
          getStartDateInTimeZone: getStartDateInTimeZone,
          getEndDateInTimeZone: getEndDateInTimeZone
        },
        [
          getDate(2020, 12, 1, 10, 35),
          getDate(2020, 12, 3, 10, 35),
          getDate(2020, 12, 5, 10, 35),
          getDate(2020, 12, 7, 10, 35),
          getDate(2020, 12, 9, 10, 35)
        ]
      );
    });

    it('should daily schedule with end date', function () {

      checkGenerateScheduleDates(
        {
          scheduleType: ScheduleType.DAILY,
          timeZone: TEST_TIME_ZONE,
          sendTime: "10:35",
          startDate: getDate(2020, 12, 31, 0, 0),
          endDate: getDate(2021, 1, 10, 0, 0),
          dayRecurrenceCount: 5,
          getStartDateInTimeZone: getStartDateInTimeZone,
          getEndDateInTimeZone: getEndDateInTimeZone
        },
        [
          getDate(2020, 12, 31, 10, 35),
          getDate(2021, 1, 5, 10, 35),
          getDate(2021, 1, 10, 10, 35)
        ]
      );
    });

    it('should weekly schedule every 3rd Monday', function () {

      checkGenerateScheduleDates(
        {
          scheduleType: ScheduleType.WEEKY,
          timeZone: TEST_TIME_ZONE,
          sendTime: "10:35",
          startDate: getDate(2020, 12, 1, 10, 35),
          endAfterOccurrenceCount: 5,
          weekRecurrenceCount: 3,
          dayOfWeek: [false, true, false, false, false, false, false],
          getStartDateInTimeZone: getStartDateInTimeZone,
          getEndDateInTimeZone: getEndDateInTimeZone
        },
        [
          getDate(2020, 12, 7, 10, 35),
          getDate(2020, 12, 28, 10, 35),
          getDate(2021, 1, 18, 10, 35),
          getDate(2021, 2, 8, 10, 35),
          getDate(2021, 3, 1, 10, 35)
        ]
      );
    });

    it('should weekly schedule every 2nd week Tuesday and Sunday', function () {

      checkGenerateScheduleDates(
        {
          scheduleType: ScheduleType.WEEKY,
          timeZone: TEST_TIME_ZONE,
          sendTime: "10:35",
          startDate: getDate(2020, 12, 1, 10, 35),
          endAfterOccurrenceCount: 5,
          weekRecurrenceCount: 3,
          dayOfWeek: [true, false, true, false, false, false, false],
          getStartDateInTimeZone: getStartDateInTimeZone,
          getEndDateInTimeZone: getEndDateInTimeZone
        },
        [
          getDate(2020, 12, 1, 10, 35),
          getDate(2020, 12, 20, 10, 35),
          getDate(2020, 12, 22, 10, 35),
          getDate(2021, 1, 10, 10, 35),
          getDate(2021, 1, 12, 10, 35)
        ]
      );
    });


    it('monthly schedule (byDayOfMonth) every 5th day of every 3 months', function () {

      checkGenerateScheduleDates(
        {
          scheduleType: ScheduleType.MONTHLY,
          timeZone: TEST_TIME_ZONE,
          sendTime: "10:35",
          startDate: getDate(2020, 12, 1, 10, 35),
          endAfterOccurrenceCount: 5,
          byDayOfMonth: {
            dayOfMonth: 5,
            monthRecurrenceCount: 3
          },
          getStartDateInTimeZone: getStartDateInTimeZone,
          getEndDateInTimeZone: getEndDateInTimeZone
        },
        [
          getDate(2020, 12, 5, 10, 35),
          getDate(2021, 3, 5, 10, 35),
          getDate(2021, 6, 5, 10, 35),
          getDate(2021, 9, 5, 10, 35),
          getDate(2021, 12, 5, 10, 35)
        ]
      );
    });


    it('monthly schedule (byDayOfMonth) every 31st day of every month', function () {

      checkGenerateScheduleDates(
        {
          scheduleType: ScheduleType.MONTHLY,
          timeZone: TEST_TIME_ZONE,
          sendTime: "10:35",
          startDate: getDate(2020, 12, 1, 10, 35),
          endAfterOccurrenceCount: 12,
          byDayOfMonth: {
            dayOfMonth: 31,
            monthRecurrenceCount: 1
          },
          getStartDateInTimeZone: getStartDateInTimeZone,
          getEndDateInTimeZone: getEndDateInTimeZone
        },
        [
          getDate(2020, 12, 31, 10, 35),
          getDate(2021, 1, 31, 10, 35),
          getDate(2021, 2, 28, 10, 35),
          getDate(2021, 3, 31, 10, 35),
          getDate(2021, 4, 30, 10, 35),
          getDate(2021, 5, 31, 10, 35),
          getDate(2021, 6, 30, 10, 35),
          getDate(2021, 7, 31, 10, 35),
          getDate(2021, 8, 31, 10, 35),
          getDate(2021, 9, 30, 10, 35),
          getDate(2021, 10, 31, 10, 35),
          getDate(2021, 11, 30, 10, 35)
        ]
      );
    });
  });


  it('monthly schedule (byDayOfMonth) every 31st day of every 6th month, no end date', function () {
    checkGenerateScheduleDates(
      {
        scheduleType: ScheduleType.MONTHLY,
        timeZone: TEST_TIME_ZONE,
        sendTime: "10:35",
        startDate: getDate(2020, 12, 1, 0, 0),
        byDayOfMonth: {
          dayOfMonth: 31,
          monthRecurrenceCount: 6
        },
        getStartDateInTimeZone: getStartDateInTimeZone,
        getEndDateInTimeZone: getEndDateInTimeZone
      },
      [
        getDate(2020, 12, 31, 10, 35),
        getDate(2021, 6, 30, 10, 35),
        getDate(2021, 12, 31, 10, 35),
        getDate(2022, 6, 30, 10, 35),
        getDate(2022, 12, 31, 10, 35),
        getDate(2023, 6, 30, 10, 35),
        getDate(2023, 12, 31, 10, 35),
        getDate(2024, 6, 30, 10, 35),
        getDate(2024, 12, 31, 10, 35),
        getDate(2025, 6, 30, 10, 35)
      ]
    );
  });


  it('monthly schedule (byDayOfMonth) February 31st correctly', function () {

    checkGenerateScheduleDates(
      {
        scheduleType: ScheduleType.MONTHLY,
        timeZone: TEST_TIME_ZONE,
        sendTime: "10:35",
        startDate: getDate(2020, 2, 29, 10, 35),
        endAfterOccurrenceCount: 3,
        byDayOfMonth: {
          dayOfMonth: 31,
          monthRecurrenceCount: 1
        },
        getStartDateInTimeZone: getStartDateInTimeZone,
        getEndDateInTimeZone: getEndDateInTimeZone
      },
      [
        getDate(2020, 2, 29, 10, 35),
        getDate(2020, 3, 31, 10, 35),
        getDate(2020, 4, 30, 10, 35)
      ]
    );
  });


  it('monthly schedule (byWeekDay) Dec 1st, first Tuesday', function () {

    checkGenerateScheduleDates(
      {
        scheduleType: ScheduleType.MONTHLY,
        timeZone: TEST_TIME_ZONE,
        sendTime: "10:35",
        startDate: getDate(2020, 12, 1, 10, 35),
        endAfterOccurrenceCount: 3,
        byWeekDay: {
          occurence: 'first',
          weekDay: 2,
          monthRecurrenceCount: 2
        },
        getStartDateInTimeZone: getStartDateInTimeZone,
        getEndDateInTimeZone: getEndDateInTimeZone
      },
      [
        getDate(2020, 12, 1, 10, 35),
        getDate(2021, 2, 2, 10, 35),
        getDate(2021, 4, 6, 10, 35)
      ]
    );
  });

  it('monthly schedule (byWeekDay) Dec 1st, last Tuesday', function () {

    checkGenerateScheduleDates(
      {
        scheduleType: ScheduleType.MONTHLY,
        timeZone: TEST_TIME_ZONE,
        sendTime: "10:35",
        startDate: getDate(2020, 12, 1, 10, 35),
        endAfterOccurrenceCount: 12,
        byWeekDay: {
          occurence: 'last',
          weekDay: 2,
          monthRecurrenceCount: 1
        },
        getStartDateInTimeZone: getStartDateInTimeZone,
        getEndDateInTimeZone: getEndDateInTimeZone
      },
      [
        getDate(2020, 12, 29, 10, 35),
        getDate(2021, 1, 26, 10, 35),
        getDate(2021, 2, 23, 10, 35),
        getDate(2021, 3, 30, 10, 35),
        getDate(2021, 4, 27, 10, 35),
        getDate(2021, 5, 25, 10, 35),
        getDate(2021, 6, 29, 10, 35),
        getDate(2021, 7, 27, 10, 35),
        getDate(2021, 8, 31, 10, 35),
        getDate(2021, 9, 28, 10, 35),
        getDate(2021, 10, 26, 10, 35),
        getDate(2021, 11, 30, 10, 35)
      ]
    );
  });




  it('monthly yearly (byMonthDay) Dec 5th every 5 years', function () {

    checkGenerateScheduleDates(
      {
        scheduleType: ScheduleType.YEARLY,
        timeZone: TEST_TIME_ZONE,
        sendTime: "10:35",
        startDate: getDate(2020, 12, 6, 10, 35),
        endAfterOccurrenceCount: 12,
        yearRecurrenceCount: 5,
        byMonthDay: {
          day: 5,
          month: 11,
        },
        getStartDateInTimeZone: getStartDateInTimeZone,
        getEndDateInTimeZone: getEndDateInTimeZone
      },
      [
        getDate(2021, 12, 5, 10, 35),
        getDate(2026, 12, 5, 10, 35),
        getDate(2031, 12, 5, 10, 35),
        getDate(2036, 12, 5, 10, 35),
        getDate(2041, 12, 5, 10, 35),
        getDate(2046, 12, 5, 10, 35),
        getDate(2051, 12, 5, 10, 35),
        getDate(2056, 12, 5, 10, 35),
        getDate(2061, 12, 5, 10, 35),
        getDate(2066, 12, 5, 10, 35),
        getDate(2071, 12, 5, 10, 35),
        getDate(2076, 12, 5, 10, 35)
      ]
    );
  });


  it('monthly yearly (byMonthDay) Feb 29th every year', function () {

    checkGenerateScheduleDates(
      {
        scheduleType: ScheduleType.YEARLY,
        timeZone: TEST_TIME_ZONE,
        sendTime: "10:35",
        startDate: getDate(2020, 1, 6, 10, 35),
        endAfterOccurrenceCount: 5,
        yearRecurrenceCount: 1,
        byMonthDay: {
          day: 31,
          month: 1,
        },
        getStartDateInTimeZone: getStartDateInTimeZone,
        getEndDateInTimeZone: getEndDateInTimeZone
      },
      [
        getDate(2020, 2, 29, 10, 35),
        getDate(2021, 2, 28, 10, 35),
        getDate(2022, 2, 28, 10, 35),
        getDate(2023, 2, 28, 10, 35),
        getDate(2024, 2, 29, 10, 35)
      ]
    );
  });




  it('yearly schedule (byWeekDay) first Tuesday in December', function () {

    checkGenerateScheduleDates(
      {
        scheduleType: ScheduleType.YEARLY,
        timeZone: TEST_TIME_ZONE,
        sendTime: "10:35",
        startDate: getDate(2020, 1, 6, 10, 35),
        endAfterOccurrenceCount: 5,
        yearRecurrenceCount: 3,
        byMonthWeekDay: {
          month: 11,
          weekDay: 1,
          occurence: 'first'
        },
        getStartDateInTimeZone: getStartDateInTimeZone,
        getEndDateInTimeZone: getEndDateInTimeZone
      },
      [
        getDate(2020, 12, 7, 10, 35),
        getDate(2023, 12, 4, 10, 35),
        getDate(2026, 12, 7, 10, 35),
        getDate(2029, 12, 3, 10, 35),
        getDate(2032, 12, 6, 10, 35)
      ]
    );
  });


  it('yearly schedule (byWeekDay) last Sunday of February', function () {

    checkGenerateScheduleDates(
      {
        scheduleType: ScheduleType.YEARLY,
        timeZone: TEST_TIME_ZONE,
        sendTime: "10:35",
        startDate: getDate(2020, 12, 6, 10, 35),
        endAfterOccurrenceCount: 5,
        yearRecurrenceCount: 3,
        byMonthWeekDay: {
          month: 1,
          weekDay: 0,
          occurence: 'last'
        },
        getStartDateInTimeZone: getStartDateInTimeZone,
        getEndDateInTimeZone: getEndDateInTimeZone
      },
      [
        getDate(2021, 2, 28, 10, 35),
        getDate(2024, 2, 25, 10, 35),
        getDate(2027, 2, 28, 10, 35),
        getDate(2030, 2, 24, 10, 35),
        getDate(2033, 2, 27, 10, 35)
      ]
    );
  });


  it('yearly schedule (byWeekDay) first Monday of January', function () {

    checkGenerateScheduleDates(
      {
        scheduleType: ScheduleType.YEARLY,
        timeZone: TEST_TIME_ZONE,
        sendTime: "10:35",
        startDate: getDate(2021, 1, 1, 10, 35),
        endAfterOccurrenceCount: 5,
        yearRecurrenceCount: 1,
        byMonthWeekDay: {
          month: 0,
          weekDay: 1,
          occurence: 'first'
        },
        getStartDateInTimeZone: getStartDateInTimeZone,
        getEndDateInTimeZone: getEndDateInTimeZone
      },
      [
        getDate(2021, 1, 4, 10, 35),
        getDate(2022, 1, 3, 10, 35),
        getDate(2023, 1, 2, 10, 35),
        getDate(2024, 1, 1, 10, 35),
        getDate(2025, 1, 6, 10, 35)
      ]
    );
  });


});
