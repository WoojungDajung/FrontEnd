"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../shared/Button";
import VoteCalendar, { VoteState } from "./VoteCalendar";
import { addDays, dateToString } from "@/utils/calendar";
import useVoteDate from "@/hooks/useVoteDate";
import useDateVoteStatusByUserQuery from "@/hooks/useDateVoteStatusByUserQuery";
import LoadingSpinner from "../shared/LoadingSpinner";
import { useConfirm } from "@/context/ConfirmContext";
import { useToast } from "@/context/ToastContext";

type VoteStatus = {
  possible: Set<string>; // YYYY-MM-DD 형식의 문자열
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
  const confirm = useConfirm();
  const { toast } = useToast();

  const [status, setStatus] = useState<VoteStatus>({
    possible: new Set(),
    uncertain: new Set(),
  });

  const { data } = useDateVoteStatusByUserQuery(appointmentId, userId, {
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  /* 기존 투표 데이터로 초기화  */
  const initialStatusRef = useRef<VoteStatus | null>(null);

  useEffect(() => {
    if (!data) return;
    if (initialStatusRef.current) return;

    const initialStatus = {
      possible: new Set(data.possibleList),
      uncertain: new Set(data.ambList),
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus(initialStatus);
    initialStatusRef.current = initialStatus;
  }, [data]);

  const onChange = (date: Date, prevState: VoteState, nextState: VoteState) => {
    const value = dateToString(date);
    const newSelected = new Set(status.possible);
    const newUncertain = new Set(status.uncertain);

    // 기존 상태 제거
    if (prevState === "possible") {
      newSelected.delete(value);
    } else if (prevState === "uncertain") {
      newUncertain.delete(value);
    }
    // 투표 상태 반영
    if (nextState === "possible") {
      newSelected.add(value);
    } else if (nextState === "uncertain") {
      newUncertain.add(value);
    }

    setStatus({
      possible: newSelected,
      uncertain: newUncertain,
    });
  };

  /* 투표 제출 */
  const { mutate, isPending, isSuccess } = useVoteDate(appointmentId, userId);

  const submit = async () => {
    const result = await confirm({
      title: "저장하기",
      message: "투표를 저장하시겠습니까?",
    });
    if (result) {
      const votes: {
        date: string;
        type: "POSSIBLE" | "IMPOSSIBLE" | "UNCERTAIN";
      }[] = [];

      // 초기값과 비교해서 분류
      const initialStatus = initialStatusRef.current;

      // 기존 initialStatus에서 possible, uncertain인 것들 중 현재 status에 없으면 -> IMPOSSIBLE로 변경 필요

      const possibleDates = new Set(status.possible);
      const uncertainDates = new Set(status.uncertain);
      // initialStatus 확인
      if (initialStatus) {
        // 기존에 가능했던 날짜 확인
        for (const date of initialStatus.possible) {
          if (possibleDates.has(date)) {
            // POSSIBLE -> POSSIBLE
            possibleDates.delete(date);
            continue;
          }
          if (uncertainDates.has(date)) {
            // POSSIBLE -> UNCERTAIN
            uncertainDates.delete(date);
            votes.push({ date, type: "UNCERTAIN" });
          } else {
            // POSSIBLE -> IMPOSSIBLE
            votes.push({ date, type: "IMPOSSIBLE" });
          }
        }
        // 기존에 애매했던 날짜 확인
        for (const date of initialStatus.uncertain) {
          if (uncertainDates.has(date)) {
            // UNCERTAIN -> UNCERTAIN
            uncertainDates.delete(date);
            continue;
          }
          if (possibleDates.has(date)) {
            // UNCERTAIN -> POSSIBLE
            possibleDates.delete(date);
            votes.push({ date, type: "POSSIBLE" });
          } else {
            // UNCERTAIN -> IMPOSSIBLE
            votes.push({ date, type: "IMPOSSIBLE" });
          }
        }
      }
      // 남은 투표(IMPOSSIBLE -> POSSIBLE/UNCERTAIN)
      for (const date of possibleDates) {
        votes.push({ date, type: "POSSIBLE" });
      }
      for (const date of uncertainDates) {
        votes.push({ date, type: "UNCERTAIN" });
      }

      mutate(
        { votes },
        {
          onSuccess: () => {
            toast({ message: "투표가 완료됐어요." });
            onSubmit();
          },
          onError: () => {
            toast({
              message: "투표에 실패했습니다. 잠시 후 다시 시도해주세요.",
            });
          },
        },
      );
    }
  };

  const tomorrow = useMemo(() => addDays(new Date(), 1), []);

  return (
    <div className="relative">
      <VoteCalendar startDate={tomorrow} value={status} onChange={onChange} />
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
      <Button size="Medium" color="Primary" onClick={submit}>
        저장하기
      </Button>

      {(isPending || isSuccess) && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/25 flex justify-center items-center">
          <LoadingSpinner
            size={25}
            open={isPending || isSuccess}
            success={isSuccess}
          />
        </div>
      )}
    </div>
  );
};

export default VoteDateForm;
