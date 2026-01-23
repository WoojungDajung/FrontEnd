"use client";

import { useState } from "react";
import CountButton from "./CountButton";
import ViewCalendar from "./ViewCalendar";
import Button from "../shared/Button";
import VoteDateForm from "./VoteDateForm";

const DateVoteSection = () => {
  const [mode, setMode] = useState<"VIEW" | "VOTE">("VIEW");

  // 예시 값
  const voterNum = 6;

  return (
    <section className="flex flex-col gap-8">
      <div className="w-full flex justify-between items-center">
        <p className="typo-16-regular text-gray-800 relative left-8">일정</p>
        <CountButton
          currentCount={0}
          totalCount={voterNum}
          onClick={() => {}}
        />
      </div>
      <div className="bg-white border border-gray-100 rounded-[24px] flex flex-col gap-16 items-center pt-8 pb-16">
        {mode === "VIEW" ? (
          <>
            <ViewCalendar
              voterNum={voterNum}
            />
            <Button
              size="Medium"
              color="Primary"
              onClick={() => setMode("VOTE")}
            >
              선택하기
            </Button>
          </>
        ) : (
          <VoteDateForm
            onSubmit={() => setMode("VIEW")}
          />
        )}
      </div>
    </section>
  );
};

export default DateVoteSection;
