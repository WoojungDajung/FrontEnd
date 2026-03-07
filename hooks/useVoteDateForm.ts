"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useDateVoteStatusByUserQuery from "./useDateVoteStatusByUserQuery";
import { dateToString } from "@/utils/calendar";
import { VoteState } from "@/components/appointment/VoteCalendar";
import useVoteDate from "./useVoteDate";
import { sendGTM } from "@/lib/google-tag-manager";

type VoteStatus = {
  possible: Set<string>; // YYYY-MM-DD 형식의 문자열
  uncertain: Set<string>;
};

interface useVoteDateFormProps {
  appointmentId: string;
  userId: number;
  onSubmitSuccess: () => void;
  onSubmitError: () => void;
}

const useVoteDateForm = ({
  appointmentId,
  userId,
  onSubmitSuccess,
  onSubmitError,
}: useVoteDateFormProps) => {
  const initialStatusRef = useRef<VoteStatus | null>(null);
  const [status, setStatus] = useState<VoteStatus>({
    possible: new Set(),
    uncertain: new Set(),
  });

  const { data } = useDateVoteStatusByUserQuery(appointmentId, userId, {
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

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
  const { mutate, isPending, isSuccess, reset } = useVoteDate(
    appointmentId,
    userId,
  );

  const getVoteDataToSubmit = useCallback((status: VoteStatus) => {
    const votes: {
      date: string;
      type: "POSSIBLE" | "IMPOSSIBLE" | "UNCERTAIN";
    }[] = [];

    // 초기값과 비교해서 분류
    const initialStatus = initialStatusRef.current;

    // 기존 initialStatus에서 possible, uncertain인 것들 중 현재 status에 없으면 -> IMPOSSIBLE로 변경 필요

    const possibleDates = new Set(status.possible);
    const uncertainDates = new Set(status.uncertain);

    const possibleCount = possibleDates.size;
    const uncertainCount = uncertainDates.size;

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

    return {
      votes,
      possibleCount,
      uncertainCount,
    };
  }, []);

  const submitForm = () => {
    const { votes, possibleCount, uncertainCount } =
      getVoteDataToSubmit(status);

    mutate(
      { votes },
      {
        onSuccess: () => {
          sendGTM({
            event: "submit_vote",
            appointment_id: appointmentId,
            vote_type: "schedule",
          });
          sendGTM({
            event: "save_date",
            appointment_id: appointmentId,
            possible_count: possibleCount, // '가능' 선택 개수
            maybe_count: uncertainCount, // '애매' 선택 개수
          });

          onSubmitSuccess();
        },
        onError: () => {
          reset();
          onSubmitError();
        },
      },
    );
  };

  return {
    status,
    onChange,
    submitForm,
    isSubmitPending: isPending,
    isSubmitSuccess: isSuccess,
  };
};

export default useVoteDateForm;
