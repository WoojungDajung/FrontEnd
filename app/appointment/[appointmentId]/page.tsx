import { getAppointment } from "@/src/features/appointment-detail/api/getAppointment";
import DateVoteSection from "@/src/features/appointment-detail/vote-date/ui/DateVoteSection";
import HomeButton from "@/src/features/appointment-detail/ui/HomeButton";
import AppointmentSettledSection from "@/src/features/appointment-detail/vote-result/ui/AppointmentSettledSection";
import PlaceVoteSection from "@/src/features/appointment-detail/vote-location/ui/PlaceVoteSection";
import { AppointmentPageProvider } from "@/src/features/appointment-detail/context/AppointmentContext";
import { getQueryClient } from "@/src/shared/lib/queryClient";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import dayjs from "dayjs";
import CommonLayout from "@/src/shared/ui/layouts/CommonLayout";
import AppointmentPageEffect from "@/app/appointments/_components/AppointmentPageEffect";
import { getMemberProfile } from "@/src/features/appointment-detail/appointment-info/api/getMemberProfile";
import { getDateVoteStatus } from "@/src/features/appointment-detail/vote-date/api/getDateVoteStatus";
import { getVoteStatusByMonth } from "@/src/features/appointment-detail/vote-date/api/getVoteStatusByMonth";
import { getLocationVoteStatus } from "@/src/features/appointment-detail/vote-location/api/getLocationVoteStatus";
import { getLocations } from "@/src/features/appointment-detail/vote-location/api/getLocations";
import { API_ERROR_CODE } from "@/src/shared/lib/error/errorCode";
import { ApiError } from "@/src/shared/lib/error/ApiError";
import AppointmentInfoSection from "@/src/features/appointment-detail/appointment-info/ui/AppointmentInfoSection";

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
      queryFn: ({ queryKey }) => getDateVoteStatus(queryKey[1], requestInit),
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
                <DateVoteSection appointmentId={appointmentId} />
                <PlaceVoteSection appointmentId={appointmentId} />
              </div>
            </AppointmentPageProvider>
          </div>
        </main>
        <AppointmentPageEffect appointmentId={appointmentId} />
      </HydrationBoundary>
    </CommonLayout>
  );
};

export default Page;
