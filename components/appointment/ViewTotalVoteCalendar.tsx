import { memo, useCallback, useMemo, useState } from "react";
import ViewCalendarShell from "./ViewCalendarShell";
import { cn } from "@/utils/cn";
import VoteStatusByDateModal from "./VoteStatusByDateModal";
import { addMonths, dateToString, startOfMonth } from "@/utils/calendar";
import useDateVoteStatusByMonthQuery, {
  getDateVoteStatusByMonthQueryOptions,
} from "@/hooks/useDateVoteStatusByMonthQuery";
import { useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "../shared/LoadingSpinner";

interface ViewTotalVoteCalendarProps {
  appointmentId: string;
}

const ViewTotalVoteCalendar = ({
  appointmentId,
}: ViewTotalVoteCalendarProps) => {
  const queryClient = useQueryClient();

  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState<Date>(() => startOfMonth(new Date()));

  const { data, isFetching } = useDateVoteStatusByMonthQuery(
    appointmentId,
    month,
  );

  const voteRatioMap = useMemo(() => {
    const voteRatio = new Map<string, number>();
    if (data) {
      for (const { ymd, percentage } of data.dateList) {
        voteRatio.set(ymd, Number(percentage));
      }
    }
    return voteRatio;
  }, [data]);

  const onMonthChange = useCallback(
    (next: Date) => {
      setMonth(next);

      // 이전 달 데이터 prefetch
      queryClient.prefetchQuery(
        getDateVoteStatusByMonthQueryOptions(
          appointmentId,
          addMonths(next, -1),
        ),
      );
      // 다음 달 데이터 prefetch
      queryClient.prefetchQuery(
        getDateVoteStatusByMonthQueryOptions(
          appointmentId,
          addMonths(next, +1),
        ),
      );
    },
    [queryClient, appointmentId],
  );

  return (
    <div className="relative">
      <ViewCalendarShell
        initialMonth={today}
        onMonthChange={onMonthChange}
        renderCell={(meta) => (
          <DateCell
            {...meta}
            votePercentage={voteRatioMap.get(dateToString(meta.date)) ?? 0}
            appointmentId={appointmentId}
          />
        )}
      />
      {isFetching && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/25 flex justify-center items-center">
          <LoadingSpinner size={25} open={true} />
        </div>
      )}
    </div>
  );
};

interface DateCellProps {
  date: Date;
  isOutsideMonth: boolean;
  isDisabled: boolean;
  votePercentage: number;
  appointmentId: string;
}

const DateCell = ({
  date,
  isOutsideMonth,
  isDisabled,
  votePercentage,
  appointmentId,
}: DateCellProps) => {
  const [dateStatusModalOpen, setDateStatusModalOpen] = useState(false);

  const clickable = !isOutsideMonth && votePercentage > 0;

  const onClick = () => {
    if (!clickable) {
      return;
    }
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
    if (votePercentage > 0) {
      if (votePercentage >= 71) {
        cellStyle = "bg-primary-400 text-white";
      } else if (votePercentage >= 31) {
        cellStyle = "bg-primary-100 text-primary-800";
      } else {
        cellStyle = "bg-primary-25 text-primary-600";
      }
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
          clickable && "cursor-pointer",
          cellStyle,
        )}
        onClick={onClick}
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

export default memo(ViewTotalVoteCalendar);
