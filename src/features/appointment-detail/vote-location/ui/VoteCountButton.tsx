import { useState } from "react";
import CountButton from "../../ui/CountButton";
import useLocationVoteStatusQuery from "../hooks/useLocationVoteStatusQuery";
import VoteStatusModal from "../../ui/VoteStatusModal";

const VoteCountButton = ({ appointmentId }: { appointmentId: string }) => {
  const [voteStatusModalOpen, setVoteStatusModalOpen] = useState(false);

  // 장소 목록 및 투표 현황
  const { data } = useLocationVoteStatusQuery(appointmentId);

  if (!data) return <></>;
  return (
    <>
      <CountButton
        currentCount={data.votedListCount}
        totalCount={data.unVotedListCount + data.votedListCount}
        onClick={() => setVoteStatusModalOpen(true)}
      />

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
