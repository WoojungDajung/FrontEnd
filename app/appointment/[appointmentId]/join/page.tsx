import JoinAppointmentForm from "@/components/meeting/JoinAppointmentForm";

const Page = async ({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) => {
  const { appointmentId } = await params;

  return (
    <main>
      <div className="flex flex-col gap-40">
        <div className="flex flex-col items-center">
          <p className="typo-20-bold text-gray-800">스터디밥먹으러</p>
          <div className="flex flex-row gap-8">
            <p className="typo-16-regular text-gray-600">
              투표 마감일 2026.01.06
            </p>
            <div className="w-fit h-fit bg-primary-25 px-8 py-4 text-primary-400 typo-12-regular rounded-[40px]">
              D-5
            </div>
          </div>
        </div>

        <JoinAppointmentForm appointmentId={appointmentId} />
      </div>
    </main>
  );
};

export default Page;
