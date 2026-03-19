"use client";

import { memo, useState } from "react";
import CountButton from "../../ui/CountButton";
import PlaceInfoDrawer from "./PlaceInfoDrawer";
import PlaceVoteCard from "./PlaceVoteCard";
import VoteStatusModal from "../../ui/VoteStatusModal";
import useAppointmentQuery from "../../hooks/useAppointmentQuery";
import useLocationVoteStatusQuery from "../hooks/useLocationVoteStatusQuery";

interface PlaceVoteSectionProps {
  appointmentId: string;
}

const PlaceVoteSection = ({ appointmentId }: PlaceVoteSectionProps) => {
  const { data } = useAppointmentQuery({ appointmentId });

  if (data === undefined) return null;

  const isAppointmentSettled = data.appointment.confirmYn === "Y";

  return (
    <section className="flex flex-col gap-8">
      <div className="w-full flex justify-between items-center">
        <p className="typo-16-regular text-gray-800 relative left-8">장소</p>
        <VoteCountButton appointmentId={appointmentId} />
      </div>
      <PlaceVoteCard
        appointmentId={appointmentId}
        disabled={isAppointmentSettled}
        isHost={data.appointment.hostYn === "Y"}
      />
      <PlaceInfoDrawer
        appointmentId={appointmentId}
        deletable={!isAppointmentSettled}
      />
    </section>
  );
};

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

export default memo(PlaceVoteSection);
