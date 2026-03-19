import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function startOfMonth(date: Date) {
  return dayjs(date).date(1).toDate();
}

export function endOfMonth(date: Date) {
  const lastDate = dayjs(date).daysInMonth();
  return dayjs(date).date(lastDate).toDate();
}

export function addMonths(date: Date, value: number) {
  return dayjs(date).add(value, "month").toDate();
}

export function addDays(date: Date, value: number) {
  return dayjs(date).add(value, "day").toDate();
}

/**
 *
 * @param date
 * @returns YYYY-MM-DD 형식의 문자열
 */
export function dateToString(date: Date) {
  return dayjs(date).format("YYYY-MM-DD");
}

/**
 *
 * @param str YYYY-MM-DD 형식의 문자열
 * @returns Date
 */
export function stringToDate(str: string): Date {
  return dayjs(str).toDate();
}

export function isAfterOrSameMonth(a: Date, b: Date) {
  return dayjs(a).startOf("month").isSameOrAfter(dayjs(b).startOf("month"));
}

export function isBeforeOrSameMonth(a: Date, b: Date) {
  return dayjs(a).startOf("month").isSameOrBefore(dayjs(b).startOf("month"));
}

export function isBeforeDay(a: Date, b: Date) {
  return dayjs(a).startOf("day").isBefore(dayjs(b).startOf("day"));
}
