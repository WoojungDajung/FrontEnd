"use client";

import Image from "next/image";
import Button from "../shared/Button";
import { useEffect, useState } from "react";
import MeetingResultModal from "./MeetingResultModal";
import { Appointment } from "@/types/apiResponse";

interface MeetingSettledSectionProps {
  appointment: Appointment;
}

const MeetingSettledSection = ({ appointment }: MeetingSettledSectionProps) => {
  const [resultModalOpen, setResultModalOpen] = useState(false);

  // 모달이 열려져 있도록 하기 위한 작업
  useEffect(() => {
    // resultModalOpen 초기값을 true로 하는 경우 modal div가 마운트되지 않아서 무시됨
    // 그래서 대신 마운트 이후 값을 true로 바꾸어 모달이 나타나도록 함
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResultModalOpen(true);
  }, []);

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
      <MeetingResultModal
        open={resultModalOpen}
        setOpen={setResultModalOpen}
        appointment={appointment}
      />
    </section>
  );
};

export default MeetingSettledSection;
