import { useMemo, useState } from "react";
import ViewCalendarShell from "./ViewCalendarShell";
import { cn } from "@/src/shared/utils/cn";
import { dateToString } from "@/src/shared/utils/calendar";
import VoteStatusByDateModal from "./VoteStatusByDateModal";
import useDateVoteStatusByUserQuery from "../hooks/useDateVoteStatusByUserQuery";

// 가능, 애매, 불가능
type VoteState = "POSSIBLE" | "UNCERTAIN" | "IMPOSSIBLE";

interface ViewUserVoteCalendarProps {
  appointmentId: string;
  userId: number;
}

const ViewUserVoteCalendar = ({
  appointmentId,
  userId,
}: ViewUserVoteCalendarProps) => {
  const today = useMemo(() => new Date(), []);

  const { data } = useDateVoteStatusByUserQuery(appointmentId, userId);

  const { possibleDates, uncertainDates } = useMemo(() => {
    return {
      possibleDates: new Set(data?.possibleList),
      uncertainDates: new Set(data?.ambList),
    };
  }, [data]);

  return (
    <ViewCalendarShell
      initialMonth={today}
      renderCell={(meta) => {
        const dateStr = dateToString(meta.date);
        const voteState: VoteState = possibleDates.has(dateStr)
          ? "POSSIBLE"
          : uncertainDates.has(dateStr)
            ? "UNCERTAIN"
            : "IMPOSSIBLE";

        return (
          <DateCell
            {...meta}
            voteState={voteState}
            appointmentId={appointmentId}
          />
        );
      }}
    />
  );
};

interface DateCellProps {
  date: Date;
  isOutsideMonth: boolean;
  isDisabled: boolean;
  voteState: VoteState;
  appointmentId: string;
}

const DateCell = ({
  date,
  isOutsideMonth,
  isDisabled,
  voteState,
  appointmentId,
}: DateCellProps) => {
  const [dateStatusModalOpen, setDateStatusModalOpen] = useState(false);

  const clickable = !isOutsideMonth && voteState !== "IMPOSSIBLE";

  const onClickCell = () => {
    if (!clickable) return;
    setDateStatusModalOpen(true);
  };

  let cellStyle = "";
  if (isOutsideMonth) {
    if (date.getDay() === 0) {
      cellStyle = "text-error-200";
    } else if (date.getDay() === 6) {
      cellStyle = "text-gray-300";
    } else {
      cellStyle = "text-gray-300";
    }
  } else {
    if (voteState === "POSSIBLE") {
      cellStyle = "bg-primary-400 text-white";
    } else if (voteState === "UNCERTAIN") {
      cellStyle = "bg-gray-300 text-gray-800";
    } else {
      if (date.getDay() === 0) {
        cellStyle = "text-error-500";
      } else if (date.getDay() === 6) {
        cellStyle = "text-primary-400";
      } else {
        cellStyle = "text-gray-800";
      }
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
        onClick={onClickCell}
      >
        {date.getDate()}
      </div>

      {/* 투표 현황 모달 */}
      {dateStatusModalOpen && (
        <VoteStatusByDateModal
          date={date}
          setOpen={setDateStatusModalOpen}
          appointmentId={appointmentId}
        />
      )}
    </>
  );
};

export default ViewUserVoteCalendar;
