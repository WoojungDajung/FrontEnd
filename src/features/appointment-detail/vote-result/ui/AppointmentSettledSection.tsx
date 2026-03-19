"use client";

import Image from "next/image";
import { useState } from "react";
import Button from "@/src/shared/ui/Button";
import AppointmentResultModal from "./AppointmentResultModal";
import useAppointmentQuery from "../../hooks/useAppointmentQuery";

interface AppointmentSettledSectionProps {
  appointmentId: string;
  isSettled: boolean;
}

const AppointmentSettledSection = ({
  appointmentId,
  isSettled,
}: AppointmentSettledSectionProps) => {
  const [resultModalOpen, setResultModalOpen] = useState(isSettled);

  const { data } = useAppointmentQuery({ appointmentId });

  if (
    !data ||
    data.appointment.confirmYn === "N" ||
    data.confirmedResult === null
  )
    return null;

  return (
    <section className="flex flex-col gap-24">
      <div className="pt-32 pb-24 rounded-[24px] flex flex-col items-center gap-16 border border-gray-100 bg-primary-25">
        <div className="flex flex-col gap-16 items-center">
          <Image
            src={"/images/Celebration.svg"}
            alt="폭죽"
            width={56}
            height={56}
          />
          <p className="typo-18-semibold text-gray-800 text-center">
            우리의 약속이 완성되었어요!
          </p>
        </div>
        <Button
          size="Medium"
          color="Primary"
          onClick={() => setResultModalOpen(true)}
        >
          확인하기
        </Button>
      </div>
      <p className="typo-14-regular text-gray-400 text-center">
        다시 정하고 싶다면 아래에서 마감일을 수정해보세요.
      </p>

      {/* 확정 결과 모달 */}
      {resultModalOpen && (
        <AppointmentResultModal
          setOpen={setResultModalOpen}
          appointment={data.appointment}
          appointmentUserCount={data.appointmentUserList.length}
          result={data.confirmedResult}
        />
      )}
    </section>
  );
};

export default AppointmentSettledSection;
