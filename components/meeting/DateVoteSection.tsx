"use client";

import { useState } from "react";
import CountButton from "./CountButton";
import ViewCalendar from "./ViewCalendar";
import Button from "../shared/Button";
import VoteDateForm from "./VoteDateForm";
import VoteStatusModal from "./VoteStatusModal";
import useDateVoteQuery from "@/hooks/useDateVoteQuery";

interface dateVoteSectionProps {
  appointmentId: string;
  canVote: boolean;
}

const DateVoteSection = ({ appointmentId, canVote }: dateVoteSectionProps) => {
  const [mode, setMode] = useState<"VIEW" | "VOTE">("VIEW");
  const [voteStatusModalOpen, setVoteStatusModalOpen] = useState(false);

  const { data } = useDateVoteQuery({ appointmentId });

  if (data === undefined) return <></>;

  return (
    <section className="flex flex-col gap-8">
      <div className="w-full flex justify-between items-center">
        <p className="typo-16-regular text-gray-800 relative left-8">일정</p>
        <CountButton
          currentCount={data.votedListCount}
          totalCount={data.unVotedListCount + data.votedListCount}
          onClick={() => setVoteStatusModalOpen(true)}
        />
      </div>
      <div className="bg-white border border-gray-100 rounded-[24px] flex flex-col gap-16 items-center pt-8 pb-16">
        {mode === "VIEW" ? (
          <>
            <ViewCalendar voterNum={data.votedListCount} />
            <Button
              size="Medium"
              color="Primary"
              onClick={() => setMode("VOTE")}
              disabled={!canVote}
            >
              선택하기
            </Button>
          </>
        ) : (
          <VoteDateForm onSubmit={() => setMode("VIEW")} />
        )}
      </div>

      {/* 투표 현황 모달 */}
      <VoteStatusModal
        votedMembers={data.votedList}
        unvotedMembers={data.unVotedList}
        open={voteStatusModalOpen}
        setOpen={setVoteStatusModalOpen}
      />
    </section>
  );
};

export default DateVoteSection;
