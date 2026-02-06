/* 날짜 투표용 캘린더 */

import {
  addMonths,
  dateToString,
  getDayCells,
  isBeforeDay,
  startOfMonth,
  WEEKDAYS_KO,
} from "@/utils/calendar";
import { useCallback, useMemo, useState } from "react";
import LeftChevronIcon from "../shared/icons/LeftChevronIcon";
import RightChevronIcon from "../shared/icons/RightChevronIcon";
import { cn } from "@/utils/cn";

export type VoteState = "possible" | "uncertain" | "impossible";

interface VoteCalendarProps {
  startDate: Date;
  /* 사용자의 투표 상태(선택, 애매). YYMMDD 형식의 문자열로 이루어짐 */
  value: { possible: Set<string>; uncertain: Set<string> };
  onChange?: (date: Date, prevState: VoteState, nextState: VoteState) => void;
}

type Cell = {
  day: Date;
  state: VoteState;
};

const VoteCalendar = ({ startDate, value, onChange }: VoteCalendarProps) => {
  const minMonth = useMemo(() => startOfMonth(startDate), [startDate]);
  const [curMonth, setCurMonth] = useState(startOfMonth(startDate));

  const canPrev = curMonth > minMonth;

  const cells: Cell[] = useMemo(() => {
    return getDayCells(curMonth).map((c) => {
      const dateStr = dateToString(c);
      const state = value.possible.has(dateStr)
        ? "possible"
        : value.uncertain.has(dateStr)
          ? "uncertain"
          : "impossible";

      return {
        day: c,
        state,
      };
    });
  }, [curMonth, value]);

  const onClickCell = useCallback(
    (cell: Cell) => {
      const curState = cell.state;
      const nextState =
        curState === "impossible"
          ? "possible"
          : curState === "possible"
            ? "uncertain"
            : "impossible";
      onChange?.(cell.day, curState, nextState);
    },
    [onChange],
  );

  const isDisabledCell = useCallback((date: Date) => {
    return (
      date.getMonth() !== curMonth.getMonth() || isBeforeDay(date, startDate)
    );
  }, [curMonth,startDate]);

  const getCellStyle = useCallback(
    (cell: Cell): string => {
      if (cell.state === "possible") {
        return "bg-primary-400 text-white";
      } else if (cell.state === "uncertain") {
        return "bg-gray-300 text-gray-800";
      }
      // cell.state === "impossible"
      const style: string[] = [];
      const isUnavailable = isDisabledCell(cell.day);
      if (!isUnavailable) {
        style.push("border-[0.6px] border-gray-200");
      }

      const day = cell.day.getDay();
      if (day === 0) {
        style.push(isUnavailable ? "text-error-200" : "text-error-500");
      } else if (day === 6) {
        style.push(isUnavailable ? "text-gray-300" : "text-primary-400");
      } else {
        style.push(isUnavailable ? "text-gray-300" : "text-gray-800");
      }
      return style.join(" ");
    },
    [isDisabledCell],
  );

  return (
    <div className="w-342 flex flex-col gap-4">
      {/* Header */}
      <div className="w-full py-12 flex gap-8 justify-center items-center">
        <button
          onClick={() => setCurMonth((m) => addMonths(m, -1))}
          disabled={!canPrev}
          className="button"
        >
          <LeftChevronIcon
            width={20}
            height={20}
            color="var(--color-gray-400)"
          />
        </button>

        <p className="w-224 typo-16-regular text-gray-800 block text-center">{`${curMonth.getFullYear()}년 ${curMonth.getMonth() + 1}월`}</p>

        <button
          onClick={() => setCurMonth((m) => addMonths(m, 1))}
          className="button"
        >
          <RightChevronIcon
            width={20}
            height={20}
            color="var(--color-gray-400)"
          />
        </button>
      </div>

      {/* Weekdays */}
      <div className="px-16 grid grid-cols-7 gap-4">
        {WEEKDAYS_KO.map((w) => (
          <div
            key={w}
            className={cn(
              "w-40 h-40 typo-14-regular flex justify-center items-center",
              w === "일"
                ? "text-error-500"
                : w === "토"
                  ? "text-primary-400"
                  : "text-gray-800",
            )}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="px-16 grid grid-cols-7 gap-4">
        {cells.map((cell) => {
          return (
            <button
              key={cell.day.toISOString()}
              className={cn(
                "button w-40 h-40 typo-14-regular rounded-[8px] flex justify-center items-center",
                getCellStyle(cell),
              )}
              disabled={isDisabledCell(cell.day)}
              onClick={() => onClickCell(cell)}
            >
              {cell.day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VoteCalendar;
