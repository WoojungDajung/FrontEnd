import { getAppointment } from "@/api/appointment";
import DateVoteSection from "@/components/meeting/DateVoteSection";
import MeetingInfoSection from "@/components/meeting/MeetingInfoSection";
import MeetingSettledSection from "@/components/meeting/MeetingSettledSection";
import PlaceVoteSection from "@/components/meeting/PlaceVoteSection";
import { ERROR_MESSAGE } from "@/constants/error-message";
import { AppointmentPageProvider } from "@/context/AppointmentContext";
import { getQueryClient } from "@/lib/react-query/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound, redirect } from "next/navigation";

const Page = async ({ params }: { params: Promise<{ meetingId: string }> }) => {
  const { meetingId } = await params;

  const queryClient = getQueryClient();

  let appointmentInfo;

  try {
    appointmentInfo = await queryClient.fetchQuery({
      queryKey: ["appointment", meetingId],
      queryFn: ({ queryKey }) => getAppointment(queryKey[1]),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.message === ERROR_MESSAGE.APPOINTMENT_NOT_EXIST) {
      notFound();
    }
    redirect("/error");
  }

  const isSettled = appointmentInfo.appointment.confirmYn === "Y";

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex flex-col gap-24">
        {isSettled && (
          <MeetingSettledSection appointment={appointmentInfo.appointment} />
        )}
        <AppointmentPageProvider>
          <div className="flex flex-col gap-16">
            <MeetingInfoSection appointmentId={meetingId} />
            <DateVoteSection appointmentId={meetingId} canVote={!isSettled} />
            <PlaceVoteSection
              appointmentId={meetingId}
              canRegisterOrVote={!isSettled}
            />
          </div>
        </AppointmentPageProvider>
      </main>
    </HydrationBoundary>
  );
};

export default Page;
