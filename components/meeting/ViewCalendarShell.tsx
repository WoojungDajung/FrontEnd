import {
  addMonths,
  getDayCells,
  isAfterOrSameMonth,
  isBeforeOrSameMonth,
  startOfMonth,
  WEEKDAYS_KO,
} from "@/utils/calendar";
import LeftChevronIcon from "../shared/icons/LeftChevronIcon";
import RightChevronIcon from "../shared/icons/RightChevronIcon";
import { useEffect, useEffectEvent, useState } from "react";
import { cn } from "@/utils/cn";

type CalendarCellMeta = {
  date: Date;
  isOutsideMonth: boolean;
  isDisabled: boolean;
};

interface ViewCalendarShellProps {
  initialMonth: Date;
  minMonth?: Date;
  maxMonth?: Date;
  onMonthChange?: (next: Date) => void;
  renderCell: (meta: CalendarCellMeta) => React.ReactNode;
  disabledDate?: (date: Date) => boolean;
}

const ViewCalendarShell = ({
  initialMonth,
  minMonth,
  maxMonth,
  onMonthChange,
  renderCell,
  disabledDate,
}: ViewCalendarShellProps) => {
  const [month, setMonth] = useState(() => startOfMonth(initialMonth));
  const cells = getDayCells(month);

  const canPrev = !minMonth || isAfterOrSameMonth(month, minMonth);
  const canNext = !maxMonth || isBeforeOrSameMonth(month, maxMonth);

  const onMonthChanged = useEffectEvent((next: Date) => {
    onMonthChange?.(next);
  });
  useEffect(() => {
    onMonthChanged(month);
  }, [month]);

  return (
    <div className="w-342 flex flex-col gap-4">
      {/* Header */}
      <div className="w-full py-12 flex gap-8 justify-center items-center">
        <button
          onClick={() => setMonth((m) => addMonths(m, -1))}
          disabled={!canPrev}
          className="button"
        >
          <LeftChevronIcon
            width={20}
            height={20}
            color="var(--color-gray-400)"
          />
        </button>

        <p className="w-224 typo-16-regular text-gray-800 block text-center">
          {`${month.getFullYear()}년 ${month.getMonth() + 1}월`}
        </p>

        <button
          onClick={() => setMonth((m) => addMonths(m, 1))}
          className="button"
          disabled={!canNext}
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
        {cells.map((date) => {
          const meta: CalendarCellMeta = {
            date,
            isOutsideMonth: date.getMonth() !== month.getMonth(),
            isDisabled: disabledDate?.(date) ?? false,
          };

          return <div key={date.toISOString()}>{renderCell(meta)}</div>;
        })}
      </div>
    </div>
  );
};

export default ViewCalendarShell;
