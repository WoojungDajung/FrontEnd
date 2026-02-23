import { getAppointment } from "@/api/appointment";
import DateVoteSection from "@/components/appointment/DateVoteSection";
import HomeButton from "@/components/appointment/HomeButton";
import AppointmentInfoSection from "@/components/appointment/AppointmentInfoSection";
import AppointmentSettledSection from "@/components/appointment/AppointmentSettledSection";
import PlaceVoteSection from "@/components/appointment/PlaceVoteSection";
import { ERROR_MESSAGE } from "@/constants/error-message";
import { AppointmentPageProvider } from "@/context/AppointmentContext";
import { getQueryClient } from "@/lib/react-query/get-query-client";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getMemberProfile } from "@/api/member";
import dayjs from "dayjs";
import { getVoteStatus, getVoteStatusByMonth } from "@/api/date";
import { getLocations } from "@/api/location";

async function checkJoin(
  appointmentId: string,
  queryClient: QueryClient,
  requestInit: RequestInit,
) {
  let redirectUrl = "/error";
  const joinUrl = `/appointment/${appointmentId}/join`;

  try {
    await queryClient.fetchQuery({
      queryKey: ["appointment-user-profile", appointmentId],
      queryFn: ({ queryKey }) => getMemberProfile(queryKey[1], requestInit),
    });
    return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.message === ERROR_MESSAGE.APPOINTMENT_NOT_EXIST) {
      notFound();
    } else if (error.message === ERROR_MESSAGE.LOGIN_REQUIRED) {
      redirectUrl = "/"; // 로그인 페이지로 이동
    } else if (error.message === ERROR_MESSAGE.NOT_JOINED_APPOINTMENT) {
      redirectUrl = joinUrl;
    }
  }
  redirect(redirectUrl);
}

const Page = async ({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) => {
  const { appointmentId } = await params;

  const queryClient = getQueryClient();

  const cookieStore = await cookies();
  const requestInit: RequestInit = {
    headers: {
      cookie: cookieStore.toString(),
    },
  };

  // 해당 방 참여 여부 확인 및 처리
  await checkJoin(appointmentId, queryClient, requestInit);

  let appointmentInfo;
  try {
    appointmentInfo = await queryClient.fetchQuery({
      queryKey: ["appointment", appointmentId],
      queryFn: async ({ queryKey }) => getAppointment(queryKey[1], requestInit),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.message === ERROR_MESSAGE.APPOINTMENT_NOT_EXIST) {
      notFound();
    }
    redirect("/error");
  }

  // prefetch
  const month = dayjs(new Date()).format("YYYY-MM");
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["date-vote-status-by-month", appointmentId, month],
      queryFn: ({ queryKey }) =>
        getVoteStatusByMonth(queryKey[1], queryKey[2], requestInit),
    }),
    queryClient.prefetchQuery({
      queryKey: ["date-vote-status", appointmentId],
      queryFn: ({ queryKey }) => getVoteStatus(queryKey[1], requestInit),
    }),
    queryClient.prefetchQuery({
      queryKey: ["appointment-locations", appointmentId],
      queryFn: ({ queryKey }) => getLocations(queryKey[1], requestInit),
    }),
  ]);

  const isSettled = appointmentInfo.appointment.confirmYn === "Y";

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex flex-col gap-8 pt-80">
        <HomeButton />

        <div className="flex flex-col gap-24">
          {isSettled && appointmentInfo.confirmedResult !== null && (
            <AppointmentSettledSection
              appointment={appointmentInfo.appointment}
              appointmentUserCount={appointmentInfo.appointmentUserList.length}
              result={appointmentInfo.confirmedResult}
            />
          )}
          <AppointmentPageProvider>
            <div className="flex flex-col gap-16">
              <AppointmentInfoSection appointmentId={appointmentId} />
              <DateVoteSection
                appointmentId={appointmentId}
                canVote={!isSettled}
              />
              <PlaceVoteSection
                appointmentId={appointmentId}
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
