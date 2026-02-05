"use client";

import { useState } from "react";
import CountButton from "./CountButton";
import Button from "../shared/Button";
import VoteDateForm from "./VoteDateForm";
import VoteStatusModal from "./VoteStatusModal";
import useDateVoteQuery from "@/hooks/useDateVoteQuery";
import ViewTotalVoteCalendar from "./ViewTotalVoteCalendar";
import { useAppointmentPage } from "@/context/AppointmentContext";
import ViewUserVoteCalendar from "./ViewUserVoteCalendar";
import useAppointmentUserProfileQuery from "@/hooks/useAppointmentUserProfileQuery";

interface dateVoteSectionProps {
  appointmentId: string;
  canVote: boolean;
}

const DateVoteSection = ({ appointmentId, canVote }: dateVoteSectionProps) => {
  const [mode, setMode] = useState<"VIEW" | "VOTE">("VIEW");
  const [voteStatusModalOpen, setVoteStatusModalOpen] = useState(false);

  const { selectedParticipantId } = useAppointmentPage();

  // 사용자의 프로필. 프로필 등록 전엔 null (룸 생성자는 프로필은 존재함. nickName, startingPlace가 null)
  const { data: profileData } = useAppointmentUserProfileQuery({
    appointmentId,
  });

  const { data } = useDateVoteQuery({ appointmentId });

  const isRegistered =
    profileData !== undefined &&
    profileData !== null &&
    profileData?.memberNickName !== null;

  const isVotable = canVote && isRegistered;

  const onClickVoteButton = () => {
    if (!isVotable) return;

    setMode("VOTE");
  };

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
        {selectedParticipantId !== null ? (
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
        ) : mode === "VIEW" ? (
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
        ) : (
          profileData && (
            <VoteDateForm
              appointmentId={appointmentId}
              onSubmit={() => setMode("VIEW")}
              userId={profileData.id}
            />
          )
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
