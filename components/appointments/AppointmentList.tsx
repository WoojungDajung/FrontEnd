"use client";

import useMemberAppointmentQuery from "@/hooks/useMemberAppointmentQuery";
import LoadingSpinner from "../shared/LoadingSpinner";
import Link from "next/link";

const AppointmentList = () => {
  const { data } = useMemberAppointmentQuery();

  if (data === undefined) {
    return (
      <div className="w-full h-340 flex justify-center items-center">
        <LoadingSpinner open size={25} />
      </div>
    );
  }

  const { appointmentList, appointmentCount } = data;

  if (appointmentCount === "0" || appointmentList.length === 0) {
    return (
      <div className="w-full h-340 grid place-items-center">
        <p className="typo-14-regular text-gray-400 text-center">
          아직 약속이 없네요!
          <br />
          이번 주말 친구들과 만나는 거 어때요?
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-8">
      {appointmentList.map((appointment) => (
        <li key={appointment.appointmentId}>
          <Link
            href={`/appointment/${appointment.appointmentId}`}
            className="p-16 flex flex-col gap-4 bg-gray-25 inset-ring-1 inset-ring-gray-200 rounded-[16px]"
          >
            <p className="typo-16-semibold text-gray-800">
              {appointment.appointmentName}
            </p>

            <div className="grid grid-cols-[max-content_max-content_max-content] gap-x-4 gap-y-0">
              {/* 1행 */}
              <div className="typo-16-regular text-gray-400">투표 마감일</div>
              <div className="typo-16-regular text-gray-500">
                {appointment.appointmentDueDate}
              </div>
              <div className="ml-4 w-fit h-fit bg-primary-25 px-8 py-4 text-primary-400 typo-12-regular rounded-[40px]">
                {appointment.dday}
              </div>
              {/* 2행 */}
              <div className="typo-16-regular text-gray-400">참여 인원</div>
              <div className="typo-16-regular text-gray-500">
                {`${appointment.participantCount}명`}
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default AppointmentList;
