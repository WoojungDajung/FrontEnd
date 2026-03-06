import { VoteDate } from "@/types/apiResponse";
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

export function matchCell(
  cells: Date[],
  voteDays: VoteDate[],
): {
  date: Date;
  percentage: number; // 표가 없으면 color는 undefined
}[] {
  const datePercentageMap = new Map<string, number>();
  for (const day of voteDays) {
    const { ymd, percentage } = day;
    datePercentageMap.set(ymd, Number(percentage));
  }

  return cells.map((cell) => {
    const ymd = dayjs(cell).format("YYYY-MM-DD");

    return {
      date: cell,
      percentage: datePercentageMap.get(ymd) ?? 0,
    };
  });
}

export function getDayCells(month: Date): Date[] {
  const first = startOfMonth(month);
  const last = endOfMonth(month);

  const cells: Date[] = [];

  const firstDay = first.getDay(); // 일(0)~토(6)
  for (let i = 0; i < firstDay; i++) {
    cells.push(
      dayjs(first)
        .subtract(firstDay - i, "day")
        .toDate(),
    );
  }
  for (let i = 1; i <= last.getDate(); i++) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), i));
  }

  const remainder = cells.length % 7;
  if (remainder !== 0) {
    for (let i = 1; i <= 7 - remainder; i++) {
      cells.push(dayjs(last).add(i, "day").toDate());
    }
  }

  return cells;
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
