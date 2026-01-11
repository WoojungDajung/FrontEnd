import DateVoteSection from "@/components/meeting/DateVoteSection";
import MeetingInfoSection from "@/components/meeting/MeetingInfoSection";
import PlaceVoteSection from "@/components/meeting/PlaceVoteSection";

const Page = async ({ params }: { params: Promise<{ meetingId: string }> }) => {
  const { meetingId } = await params;

  return (
    <main className="flex flex-col gap-16">
      <MeetingInfoSection />
      <DateVoteSection />
      <PlaceVoteSection />
    </main>
  );
};

export default Page;
