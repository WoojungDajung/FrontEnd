"use client";

import { useMemo, useState } from "react";
import Button from "../shared/Button";
import VoteCalendar, { VoteState } from "./VoteCalendar";
import { addDays, dateToString } from "@/utils/calendar";

interface VoteDateFormProps {
  onSubmit: () => void;
}

const VoteDateForm = ({ onSubmit }: VoteDateFormProps) => {
  // TODO: 초기값은 이전 사용자 투표 현황으로 교체 필요
  const [status, setStatus] = useState<{
    selected: Set<string>; // YYMMDD 형식의 문자열
    uncertain: Set<string>;
  }>({
    selected: new Set(),
    uncertain: new Set(),
  });

  const tomorrow = useMemo(() => addDays(new Date(), 1), []);

  const submit = () => {
    // TODO: 투표 반영
    onSubmit();
  };

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

  return (
    <>
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
    </>
  );
};

export default VoteDateForm;
