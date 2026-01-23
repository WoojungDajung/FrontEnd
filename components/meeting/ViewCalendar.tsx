/* 날짜 투표 조회용 캘린더 */
import {
  addMonths,
  getDayCells,
  startOfMonth,
  WEEKDAYS_KO,
} from "@/utils/calendar";
import { useCallback, useMemo, useState } from "react";
import LeftChevronIcon from "../shared/LeftChevronIcon";
import RightChevronIcon from "../shared/RightChevronIcon";
import { cn } from "@/utils/cn";

interface ViewCalendarProps {
  voterNum: number;
}

type Cell = {
  day: Date;
  count: number;
};

const ViewCalendar = ({ voterNum }: ViewCalendarProps) => {
  const [curMonth, setCurMonth] = useState(() => startOfMonth(new Date()));
  const minMonth = useMemo(() => startOfMonth(new Date()), []);

  const canPrev = curMonth > minMonth;

  // TODO: curMonth의 투표 현황 가져오기
  const cells: Cell[] = useMemo(() => {
    return getDayCells(curMonth).map((c) => ({
      day: c,
      // eslint-disable-next-line react-hooks/purity
      count: Math.floor(Math.random() * (voterNum - 0 + 1) + 0),
    }));
  }, [curMonth, voterNum]);

  const getCellStyle = useCallback(
    (cell: Cell): string => {
      const isUnavailable = cell.day.getMonth() !== curMonth.getMonth();

      const ratio = (cell.count / voterNum) * 100;
      if (!isUnavailable && ratio > 0) {
        if (ratio >= 71) {
          return "bg-primary-400 text-white";
        } else if (ratio >= 31) {
          return "bg-primary-100 text-primary-800";
        } else {
          return "bg-primary-25 text-primary-600";
        }
      }

      const day = cell.day.getDay();
      if (day === 0) {
        return isUnavailable ? "text-error-200" : "text-error-500";
      } else if (day === 6) {
        return isUnavailable ? "text-gray-300" : "text-primary-400";
      } else {
        return isUnavailable ? "text-gray-300" : "text-gray-800";
      }
    },
    [curMonth, voterNum],
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
              "w-40 h-40 typo-12-regular flex justify-center items-center",
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
            <div
              key={cell.day.toISOString()}
              className={cn(
                "w-40 h-40 typo-14-regular rounded-[8px] flex justify-center items-center",
                getCellStyle(cell),
              )}
            >
              {cell.day.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ViewCalendar;
