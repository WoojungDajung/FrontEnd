import { getAppointment } from "@/api/appointment";
import DateVoteSection from "@/components/meeting/DateVoteSection";
import MeetingInfoSection from "@/components/meeting/MeetingInfoSection";
import MeetingSettledSection from "@/components/meeting/MeetingSettledSection";
import PlaceVoteSection from "@/components/meeting/PlaceVoteSection";
import { getQueryClient } from "@/lib/react-query/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

const Page = async ({ params }: { params: Promise<{ meetingId: string }> }) => {
  const { meetingId } = await params;

  const queryClient = getQueryClient();
  const appointmentInfo = await queryClient.fetchQuery({
    queryKey: ["appointment", meetingId],
    queryFn: ({ queryKey }) => getAppointment(queryKey[1]),
  });

  const isSettled = appointmentInfo.appointment.confirmYn === "Y";

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex flex-col gap-24">
        {isSettled && <MeetingSettledSection />}
        <div className="flex flex-col gap-16">
          <MeetingInfoSection appointmentId={meetingId} />
          <DateVoteSection appointmentId={meetingId} canVote={!isSettled} />
          <PlaceVoteSection appointmentId={meetingId} canRegisterOrVote={!isSettled} />
        </div>
      </main>
    </HydrationBoundary>
  );
};

export default Page;
