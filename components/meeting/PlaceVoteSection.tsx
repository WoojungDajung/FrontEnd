"use client";

import useAppointmentUserProfileQuery from "@/hooks/useAppointmentUserProfileQuery";
import CountButton from "./CountButton";
import PlaceVoteCard from "./PlaceVoteCard";
import useLocationsQuery from "@/hooks/useLocationsQuery";
import { useMemo } from "react";

interface PlaceVoteSectionProps {
  appointmentId: string;
  canRegisterOrVote: boolean;
}

const PlaceVoteSection = ({
  appointmentId,
  canRegisterOrVote,
}: PlaceVoteSectionProps) => {
  // 사용자의 프로필 (프로필 입력 전엔 nickName, startingPlace가 null, id는 부여됨)
  const { data: profileData } = useAppointmentUserProfileQuery({
    appointmentId,
  });
  // 장소 목록 및 투표 현황
  const { data: locationData } = useLocationsQuery({ appointmentId });

  const isRegistered =
    profileData !== undefined &&
    profileData !== null &&
    profileData?.memberNickName !== null;

  const { votedCount, totalCount }: { votedCount: number; totalCount: number } =
    useMemo(() => {
      if (locationData === undefined) return { votedCount: -1, totalCount: -1 };
      const [vc, tc] = locationData.memberVoteRatio.split("/");
      return {
        votedCount: Number(vc),
        totalCount: Number(tc),
      };
    }, [locationData]);

  // TODO: 로딩/에러 처리
  if (locationData === undefined) return <></>;

  return (
    <section className="flex flex-col gap-8">
      <div className="w-full flex justify-between items-center">
        <p className="typo-16-regular text-gray-800 relative left-8">장소</p>
        <CountButton currentCount={votedCount} totalCount={totalCount} />
      </div>
      <PlaceVoteCard
        appointmentId={appointmentId}
        locations={locationData.locationList}
        totalCount={totalCount}
        disabled={!isRegistered || !canRegisterOrVote}
      />
    </section>
  );
};

export default PlaceVoteSection;
