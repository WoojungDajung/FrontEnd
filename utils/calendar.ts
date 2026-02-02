import { VoteDate } from "@/types/apiResponse";
import dayjs from "dayjs";

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
  color: string | undefined; // 표가 없으면 color는 undefined
}[] {
  const dateColorMap = new Map<string, string>();
  for (const day of voteDays) {
    const { ymd, color } = day;
    dateColorMap.set(ymd, color);
  }

  return cells.map((cell) => {
    const ymd = dayjs(cell).format("YYYY-MM-DD");

    return {
      date: cell,
      color: dateColorMap.get(ymd),
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
