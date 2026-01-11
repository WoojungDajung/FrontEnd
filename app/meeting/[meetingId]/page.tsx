import DateVoteSection from "@/components/meeting/DateVoteSection";
import MeetingInfoSection from "@/components/meeting/MeetingInfoSection";

const Page = async ({ params }: { params: Promise<{ meetingId: string }> }) => {
  const { meetingId } = await params;

  return (
    <main className="flex flex-col gap-16">
      <MeetingInfoSection />
      <DateVoteSection />
    </main>
  );
};

export default Page;
