"use client";

import CountButton from "./CountButton";
import PlaceInfoDrawer from "./PlaceInfoDrawer";
import PlaceVoteCard from "./PlaceVoteCard";
import useLocationsQuery from "@/hooks/useLocationsQuery";
import { memo, useMemo } from "react";

interface PlaceVoteSectionProps {
  appointmentId: string;
  isAppointmentSettled: boolean;
}

const PlaceVoteSection = ({
  appointmentId,
  isAppointmentSettled,
}: PlaceVoteSectionProps) => {
  return (
    <section className="flex flex-col gap-8">
      <div className="w-full flex justify-between items-center">
        <p className="typo-16-regular text-gray-800 relative left-8">장소</p>
        <VoteCountButton appointmentId={appointmentId} />
      </div>
      <PlaceVoteCard
        appointmentId={appointmentId}
        disabled={isAppointmentSettled}
      />
      <PlaceInfoDrawer
        appointmentId={appointmentId}
        deletable={!isAppointmentSettled}
      />
    </section>
  );
};

const VoteCountButton = ({ appointmentId }: { appointmentId: string }) => {
  // 장소 목록 및 투표 현황
  const { data } = useLocationsQuery({ appointmentId });

  const { votedCount, totalCount } = useMemo(() => {
    if (data === undefined) return { votedCount: 0, totalCount: 0 };
    const [vc, tc] = data.memberVoteRatio.split("/");
    return {
      votedCount: Number(vc),
      totalCount: Number(tc),
    };
  }, [data]);

  if (!data) return <></>;
  return <CountButton currentCount={votedCount} totalCount={totalCount} />;
};

export default memo(PlaceVoteSection);
