import { useEffect, useEffectEvent, useMemo, useState } from "react";
import {
  addMonths,
  isAfterOrSameMonth,
  isBeforeOrSameMonth,
  startOfMonth,
  WEEKDAYS_KO,
} from "@/src/shared/utils/calendar";
import { cn } from "@/src/shared/utils/cn";
import LeftChevronIcon from "@/src/shared/ui/icons/LeftChevronIcon";
import RightChevronIcon from "@/src/shared/ui/icons/RightChevronIcon";
import { getDayCells } from "../utils/getDayCells";

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
  const cells = useMemo(() => getDayCells(month), [month]);

  const canPrev = useMemo(
    () => !minMonth || isAfterOrSameMonth(month, minMonth),
    [month, minMonth],
  );
  const canNext = useMemo(
    () => !maxMonth || isBeforeOrSameMonth(month, maxMonth),
    [month, maxMonth],
  );

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
