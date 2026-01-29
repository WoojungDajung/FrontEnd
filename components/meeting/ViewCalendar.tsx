/* 날짜 투표 조회용 캘린더 */
import {
  addMonths,
  getDayCells,
  startOfMonth,
  WEEKDAYS_KO,
} from "@/utils/calendar";
import { useMemo, useState } from "react";
import LeftChevronIcon from "../shared/icons/LeftChevronIcon";
import RightChevronIcon from "../shared/icons/RightChevronIcon";
import { cn } from "@/utils/cn";
import VoteStatusByDateModal from "./VoteStatusByDateModal";

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
        {cells.map((cell) => (
          <DateCell
            key={cell.day.toISOString()}
            isCurMonth={cell.day.getMonth() === curMonth.getMonth()}
            date={cell.day}
            ratio={(cell.count / voterNum) * 100}
          />
        ))}
      </div>
    </div>
  );
};

const DateCell = ({
  isCurMonth,
  ratio,
  date,
}: {
  isCurMonth: boolean;
  ratio: number;
  date: Date;
}) => {
  const [dateStatusModalOpen, setDateStatusModalOpen] = useState(false);

  const clickable = isCurMonth && ratio > 0;

  const onClick = () => {
    if (!clickable) {
      return;
    }
    setDateStatusModalOpen(true);
  };

  let cellStyle = "";
  if (isCurMonth && ratio > 0) {
    if (ratio >= 71) {
      cellStyle = "bg-primary-400 text-white";
    } else if (ratio >= 31) {
      cellStyle = "bg-primary-100 text-primary-800";
    } else {
      cellStyle = "bg-primary-25 text-primary-600";
    }
  } else {
    if (date.getDay() === 0) {
      cellStyle = isCurMonth ? "text-error-500" : "text-error-200";
    } else if (date.getDay() === 6) {
      cellStyle = isCurMonth ? "text-primary-400" : "text-gray-300";
    } else {
      cellStyle = isCurMonth ? "text-gray-800" : "text-gray-300";
    }
  }

  return (
    <>
      <div
        className={cn(
          "w-40 h-40 typo-14-regular rounded-[8px] flex justify-center items-center",
          cellStyle,
          clickable && "cursor-pointer",
        )}
        onClick={onClick}
      >
        {date.getDate()}
      </div>

      {/* 투표 현황 모달 */}
      <VoteStatusByDateModal
        date={date}
        open={dateStatusModalOpen}
        setOpen={setDateStatusModalOpen}
      />
    </>
  );
};

export default ViewCalendar;
