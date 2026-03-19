"use client";

import { useState } from "react";
import useDateVoteQuery from "../hooks/useDateVoteQuery";
import CountButton from "../../ui/CountButton";
import VoteStatusModal from "../../ui/VoteStatusModal";

interface VoteCountButtonProps {
  appointmentId: string;
}

const VoteCountButton = ({ appointmentId }: VoteCountButtonProps) => {
  const [voteStatusModalOpen, setVoteStatusModalOpen] = useState(false);

  const { data } = useDateVoteQuery({ appointmentId });

  if (!data) return <></>;

  return (
    <>
      <CountButton
        currentCount={data.votedListCount}
        totalCount={data.unVotedListCount + data.votedListCount}
        onClick={() => setVoteStatusModalOpen(true)}
      />

      {/* 투표 현황 모달 */}
      {voteStatusModalOpen && (
        <VoteStatusModal
          votedMembers={data.votedList}
          unvotedMembers={data.unVotedList}
          setOpen={setVoteStatusModalOpen}
        />
      )}
    </>
  );
};

export default VoteCountButton;
