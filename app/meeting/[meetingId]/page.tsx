import DateVoteSection from "@/components/meeting/DateVoteSection";
import MeetingInfoSection from "@/components/meeting/MeetingInfoSection";
import MeetingSettledSection from "@/components/meeting/MeetingSettledSection";
import PlaceVoteSection from "@/components/meeting/PlaceVoteSection";

const Page = async ({ params }: { params: Promise<{ meetingId: string }> }) => {
  const { meetingId } = await params;

  // TODO: 약속 확정 여부 확인
  const isSettled = true;

  return (
    <main className="flex flex-col gap-24">
      {isSettled && <MeetingSettledSection />}
      <div className="flex flex-col gap-16">
        <MeetingInfoSection />
        <DateVoteSection />
        <PlaceVoteSection />
      </div>
    </main>
  );
};

export default Page;
