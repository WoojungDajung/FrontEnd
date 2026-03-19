"use client";

import { memo } from "react";
import PlaceInfoDrawer from "./PlaceInfoDrawer";
import PlaceVoteCard from "./PlaceVoteCard";
import useAppointmentQuery from "../../hooks/useAppointmentQuery";
import VoteCountButton from "./VoteCountButton";

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

export default memo(PlaceVoteSection);
