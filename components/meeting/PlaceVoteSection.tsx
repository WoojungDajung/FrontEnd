"use client";

import useAppointmentUserProfileQuery from "@/hooks/useAppointmentUserProfileQuery";
import CountButton from "./CountButton";
import PlaceVoteCard from "./PlaceVoteCard";

interface PlaceVoteSectionProps {
  appointmentId: string;
}

const PlaceVoteSection = ({ appointmentId }: PlaceVoteSectionProps) => {
  // 사용자의 프로필. 프로필 등록 전엔 null (룸 생성자는 프로필은 존재함. nickName, startingPlace가 null)
  const { data: profileData } = useAppointmentUserProfileQuery({
    appointmentId,
  });

  const isRegistered =
    profileData !== undefined &&
    profileData !== null &&
    profileData?.memberNickName !== null;

  return (
    <section className="flex flex-col gap-8">
      <div className="w-full flex justify-between items-center">
        <p className="typo-16-regular text-gray-800 relative left-8">장소</p>
        <CountButton currentCount={0} totalCount={0} onClick={() => {}} />
      </div>
      <PlaceVoteCard appointmentId={appointmentId} disabled={!isRegistered} />
    </section>
  );
};

export default PlaceVoteSection;
