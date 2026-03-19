"use client";

import { memo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/src/shared/ui/Button";
import CountButton from "../../ui/CountButton";
import VoteDateForm from "./VoteDateForm";
import VoteStatusModal from "../../ui/VoteStatusModal";
import ViewTotalVoteCalendar from "./ViewTotalVoteCalendar";
import ViewUserVoteCalendar from "./ViewUserVoteCalendar";
import useDateVoteQuery from "../hooks/useDateVoteQuery";
import { useAppointmentPage } from "../../context/AppointmentContext";
import useAppointmentUserProfileQuery from "../../appointment-info/hooks/useAppointmentUserProfileQuery";
import useAppointmentQuery from "../../hooks/useAppointmentQuery";
import { getDateVoteStatusByUser } from "../api/getDateVoteStatusByUser";

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

export default memo(DateVoteSection);
