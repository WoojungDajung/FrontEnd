import { getAppointment } from "@/api/appointment";
import DateVoteSection from "@/components/appointment/DateVoteSection";
import HomeButton from "@/components/appointment/HomeButton";
import AppointmentInfoSection from "@/components/appointment/AppointmentInfoSection";
import AppointmentSettledSection from "@/components/appointment/AppointmentSettledSection";
import PlaceVoteSection from "@/components/appointment/PlaceVoteSection";
import { AppointmentPageProvider } from "@/context/AppointmentContext";
import { getQueryClient } from "@/lib/queryClient";
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
import { getLocations, getLocationVoteStatus } from "@/api/location";
import CommonLayout from "@/components/CommonLayout";
import { ApiError } from "@/lib/error";
import { API_ERROR_CODE } from "@/constants/error-code";

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
    if (error instanceof ApiError) {
      if (error.code === API_ERROR_CODE.APPOINTMENT_NOT_EXISTED) {
        notFound();
      } else if (error.isAuthError()) {
        redirectUrl = "/"; // 로그인 페이지로 이동
      } else if (error.code === API_ERROR_CODE.NOT_JOINED_APPOINTMENT) {
        redirectUrl = joinUrl;
      }
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
    if (
      error instanceof ApiError &&
      error.code === API_ERROR_CODE.APPOINTMENT_NOT_EXISTED
    ) {
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
      queryKey: ["location-vote-status", appointmentId],
      queryFn: ({ queryKey }) =>
        getLocationVoteStatus(queryKey[1], requestInit),
    }),
    queryClient.prefetchQuery({
      queryKey: ["appointment-locations", appointmentId],
      queryFn: ({ queryKey }) => getLocations(queryKey[1], requestInit),
    }),
  ]);

  const isSettled = appointmentInfo.appointment.confirmYn === "Y";

  return (
    <CommonLayout backgroundColor="var(--color-gray-50)">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <main className="flex flex-col gap-8 pt-80">
          <HomeButton />

          <div className="flex flex-col gap-24">
            <AppointmentSettledSection
              appointmentId={appointmentId}
              isSettled={isSettled}
            />
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
    </CommonLayout>
  );
};

export default Page;
