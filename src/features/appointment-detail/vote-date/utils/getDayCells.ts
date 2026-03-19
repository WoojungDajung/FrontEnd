import { endOfMonth, startOfMonth } from "@/src/shared/utils/calendar";
import dayjs from "dayjs";

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
