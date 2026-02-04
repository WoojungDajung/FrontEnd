"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../shared/Button";
import VoteCalendar, { VoteState } from "./VoteCalendar";
import { addDays, dateToString } from "@/utils/calendar";
import useVoteDate from "@/hooks/useVoteDate";
import useDateVoteStatusByUserQuery from "@/hooks/useDateVoteStatusByUserQuery";
import LoadingSpinner from "../shared/LoadingSpinner";

type VoteStatus = {
  selected: Set<string>; // YYYY-MM-DD 형식의 문자열
  uncertain: Set<string>;
};

interface VoteDateFormProps {
  onSubmit: () => void;
  appointmentId: string;
  userId: number;
}

const VoteDateForm = ({
  onSubmit,
  appointmentId,
  userId,
}: VoteDateFormProps) => {
  const [status, setStatus] = useState<VoteStatus>({
    selected: new Set(),
    uncertain: new Set(),
  });

  const { data, isFetching } = useDateVoteStatusByUserQuery(
    appointmentId,
    userId,
    { refetchOnMount: "always" },
  );

  /* 기존 투표 데이터로 초기화  */
  const isInitiatedRef = useRef(false);

  useEffect(() => {
    if (!data) return;
    if (isInitiatedRef.current) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus({
      selected: new Set(data.possibleList),
      uncertain: new Set(data.ambList),
    });
    isInitiatedRef.current = true;
  }, [data]);

  const onChange = (date: Date, prevState: VoteState, nextState: VoteState) => {
    const value = dateToString(date);
    const newSelected = new Set(status.selected);
    const newUncertain = new Set(status.uncertain);

    // 기존 상태 제거
    if (prevState === "selected") {
      newSelected.delete(value);
    } else if (prevState === "uncertain") {
      newUncertain.delete(value);
    }
    // 투표 상태 반영
    if (nextState === "selected") {
      newSelected.add(value);
    } else if (nextState === "uncertain") {
      newUncertain.add(value);
    }

    setStatus({
      selected: newSelected,
      uncertain: newUncertain,
    });
  };

  /* 투표 제출 */
  const { mutate } = useVoteDate(appointmentId);

  const submit = () => {
    if (confirm("투표를 저장하시겠습니까?")) {
      const votes: { date: string; type: "CERTAIN" | "UNCERTAIN" }[] = [];

      for (const date of status.selected) {
        votes.push({ date, type: "CERTAIN" });
      }
      for (const date of status.uncertain) {
        votes.push({ date, type: "UNCERTAIN" });
      }

      mutate(
        { votes },
        {
          onSuccess: () => {
            onSubmit();
          },
          onError: () => {
            alert("투표 제출에 실패했습니다. 잠시 후 다시 시도해주세요.");
          },
        },
      );
    }
  };

  const tomorrow = useMemo(() => addDays(new Date(), 1), []);

  return (
    <>
      <div className="relative">
        <VoteCalendar startDate={tomorrow} value={status} onChange={onChange} />
        {isFetching && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/25 flex justify-center items-center">
            <LoadingSpinner size={25} open={true} />
          </div>
        )}
      </div>
      <div className="w-full flex flex-col gap-4 px-16">
        <div className="flex flex-row gap-16">
          <div className="flex flex-row gap-4 items-center">
            <div className="w-16 h-16 rounded-full bg-primary-400" />
            <p className="typo-14-regular text-gray-500">선택</p>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <div className="w-16 h-16 rounded-full bg-gray-300" />
            <p className="typo-14-regular text-gray-500">애매</p>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <div className="w-16 h-16 rounded-full bg-white border border-gray-200" />
            <p className="typo-14-regular text-gray-500">선택 취소</p>
          </div>
        </div>
        <p className="typo-14-regular text-gray-500">
          날짜를 여러 번 터치해서 상태를 바꿀 수 있어요.
        </p>
      </div>
      <Button size="Medium" color="Primary" onClick={submit} disabled={isFetching}>
        저장하기
      </Button>
    </>
  );
};

export default VoteDateForm;
