import { getAppointment } from "@/api/appointment";
import DateVoteSection from "@/components/meeting/DateVoteSection";
import HomeButton from "@/components/meeting/HomeButton";
import MeetingInfoSection from "@/components/meeting/MeetingInfoSection";
import MeetingSettledSection from "@/components/meeting/MeetingSettledSection";
import PlaceVoteSection from "@/components/meeting/PlaceVoteSection";
import { ERROR_MESSAGE } from "@/constants/error-message";
import { AppointmentPageProvider } from "@/context/AppointmentContext";
import { getQueryClient } from "@/lib/react-query/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

async function getAppointmentServer(appointmentId: string) {
  const cookieStore = await cookies();
  return getAppointment(appointmentId, {
    headers: {
      cookie: cookieStore.toString(),
    },
  });
}

const Page = async ({ params }: { params: Promise<{ meetingId: string }> }) => {
  const { meetingId } = await params;

  const queryClient = getQueryClient();

  let appointmentInfo;

  try {
    appointmentInfo = await queryClient.fetchQuery({
      queryKey: ["appointment", meetingId],
      queryFn: async ({ queryKey }) => getAppointmentServer(queryKey[1]),
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
      <main className="flex flex-col gap-4">
        <HomeButton />

        <div className="flex flex-col gap-24">
          {isSettled && appointmentInfo.confirmedResult !== null && (
            <MeetingSettledSection
              appointment={appointmentInfo.appointment}
              appointmentUserCount={appointmentInfo.appointmentUserList.length}
              result={appointmentInfo.confirmedResult}
            />
          )}
          <AppointmentPageProvider>
            <div className="flex flex-col gap-16">
              <MeetingInfoSection appointmentId={meetingId} />
              <DateVoteSection appointmentId={meetingId} canVote={!isSettled} />
              <PlaceVoteSection
                appointmentId={meetingId}
                isAppointmentSettled={isSettled}
              />
            </div>
          </AppointmentPageProvider>
        </div>
      </main>
    </HydrationBoundary>
  );
};

export default Page;
