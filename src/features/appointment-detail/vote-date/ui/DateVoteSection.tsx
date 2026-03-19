"use client";

import { memo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/src/shared/ui/Button";
import VoteDateForm from "./VoteDateForm";
import ViewTotalVoteCalendar from "./ViewTotalVoteCalendar";
import ViewUserVoteCalendar from "./ViewUserVoteCalendar";
import { useAppointmentPage } from "../../context/AppointmentContext";
import useAppointmentUserProfileQuery from "../../appointment-info/hooks/useAppointmentUserProfileQuery";
import useAppointmentQuery from "../../hooks/useAppointmentQuery";
import { getDateVoteStatusByUser } from "../api/getDateVoteStatusByUser";
import VoteCountButton from "./VoteCountButton";

interface dateVoteSectionProps {
  appointmentId: string;
}

const DateVoteSection = ({ appointmentId }: dateVoteSectionProps) => {
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<"VIEW" | "VOTE">("VIEW");
  const { selectedParticipantId, selectParticipant } = useAppointmentPage();

  const { data: profileData } = useAppointmentUserProfileQuery({
    appointmentId,
  });
  const { data: appointmentData } = useAppointmentQuery({ appointmentId });

  const isVotable =
    appointmentData !== undefined &&
    appointmentData.appointment.confirmYn === "N" &&
    profileData !== undefined;

  const onClickVoteButton = async () => {
    if (!isVotable) return;

    selectParticipant(null);
    await queryClient.prefetchQuery({
      queryKey: ["date-vote-status-by-user", appointmentId, profileData.id],
      queryFn: ({ queryKey }) =>
        getDateVoteStatusByUser(queryKey[1] as string, queryKey[2] as number),
    });
    setMode("VOTE");
  };

  return (
    <section className="flex flex-col gap-8">
      <div className="w-full flex justify-between items-center">
        <p className="typo-16-regular text-gray-800 relative left-8">일정</p>
        <VoteCountButton appointmentId={appointmentId} />
      </div>
      <div className="bg-white border border-gray-100 rounded-[24px] flex flex-col gap-16 items-center pt-8 pb-16 relative">
        {mode === "VOTE" && profileData && appointmentData ? (
          <VoteDateForm
            appointmentId={appointmentId}
            onSubmit={() => setMode("VIEW")}
            userId={profileData.id}
            isHost={appointmentData.appointment.hostYn === "Y"}
          />
        ) : selectedParticipantId !== null ? (
          <>
            <ViewUserVoteCalendar
              appointmentId={appointmentId}
              userId={selectedParticipantId}
            />
            <Button
              size="Medium"
              color="Primary"
              onClick={onClickVoteButton}
              disabled={!isVotable}
            >
              선택하기
            </Button>
          </>
        ) : (
          <>
            <ViewTotalVoteCalendar appointmentId={appointmentId} />
            <Button
              size="Medium"
              color="Primary"
              onClick={onClickVoteButton}
              disabled={!isVotable}
            >
              선택하기
            </Button>
          </>
        )}
      </div>
    </section>
  );
};

export default memo(DateVoteSection);
