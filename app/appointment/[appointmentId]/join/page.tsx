import { getAppointmentPreviewInfo } from "@/api/appointment";
import JoinAppointmentForm from "@/components/appointment/JoinAppointmentForm";
import { ERROR_MESSAGE } from "@/constants/error-message";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

const Page = async ({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) => {
  const { appointmentId } = await params;

  let appointmentInfo;
  try {
    const cookieStore = await cookies();
    appointmentInfo = await getAppointmentPreviewInfo(appointmentId, {
      headers: {
        cookie: cookieStore.toString(),
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.message === ERROR_MESSAGE.APPOINTMENT_NOT_EXIST) {
      notFound();
    }
    redirect("/error");
  }

  return (
    <main>
      <div className="flex flex-col gap-40">
        <div className="flex flex-col items-center">
          <p className="typo-20-bold text-gray-800">
            {appointmentInfo.appointmentName}
          </p>
          <div className="flex flex-row gap-8">
            <p className="typo-16-regular text-gray-600">
              {`투표 마감일 ${appointmentInfo.appointmentDueDate}`}
            </p>
            <div className="w-fit h-fit bg-primary-25 px-8 py-4 text-primary-400 typo-12-regular rounded-[40px]">
              {appointmentInfo.dday}
            </div>
          </div>
        </div>

        <JoinAppointmentForm appointmentId={appointmentId} />
      </div>
    </main>
  );
};

export default Page;
