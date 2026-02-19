import { getAppointment } from "@/api/appointment";
import DateVoteSection from "@/components/appointment/DateVoteSection";
import HomeButton from "@/components/appointment/HomeButton";
import AppointmentInfoSection from "@/components/appointment/AppointmentInfoSection";
import AppointmentSettledSection from "@/components/appointment/AppointmentSettledSection";
import PlaceVoteSection from "@/components/appointment/PlaceVoteSection";
import { ERROR_MESSAGE } from "@/constants/error-message";
import { AppointmentPageProvider } from "@/context/AppointmentContext";
import { getQueryClient } from "@/lib/react-query/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getMemberProfile } from "@/api/member";

async function getAppointmentServer(appointmentId: string) {
  const cookieStore = await cookies();
  return getAppointment(appointmentId, {
    headers: {
      cookie: cookieStore.toString(),
    },
  });
}

async function checkJoin(appointmentId: string) {
  let redirectUrl = "/error";
  const joinUrl = `/appointment/${appointmentId}/join`;

  try {
    const cookieStore = await cookies();
    const profile = await getMemberProfile(appointmentId, {
      headers: {
        cookie: cookieStore.toString(),
      },
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

  // 해당 방 참여 여부 확인 및 처리
  await checkJoin(appointmentId);

  const queryClient = getQueryClient();

  let appointmentInfo;
  try {
    appointmentInfo = await queryClient.fetchQuery({
      queryKey: ["appointment", appointmentId],
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
