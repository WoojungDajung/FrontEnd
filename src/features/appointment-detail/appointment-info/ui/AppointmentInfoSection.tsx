"use client";

import { useState } from "react";
import Button from "@/src/shared/ui/Button";
import PencilIcon from "./icons/PencilIcon";
import PlusIcon from "./icons/PlusIcon";
import EditAppointmentDrawer from "./EditAppointmentDrawer";
import ParticipantList from "./ParticipantList";
import ShareModal from "./ShareModal";
import useAppointmentUserProfileQuery from "../hooks/useAppointmentUserProfileQuery";
import useAppointmentQuery from "../../hooks/useAppointmentQuery";

interface AppointmentInfoSectionProps {
  appointmentId: string;
}

const AppointmentInfoSection = ({
  appointmentId,
}: AppointmentInfoSectionProps) => {
  const [appointmentDrawerOpen, setAppointmentDrawerOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const { data: appointmentData } = useAppointmentQuery({ appointmentId });
  const { data: profileData } = useAppointmentUserProfileQuery({
    appointmentId,
  });

  if (appointmentData === undefined || profileData === undefined) {
    return <></>;
  }

  const isHost = appointmentData.appointment.hostYn === "Y";

  return (
    <section className="py-16 flex flex-col gap-24 items-center bg-white border border-gray-100 rounded-[24px]">
      <div className="w-full px-16">
        <div className="flex justify-center relative">
          <p className="typo-20-bold text-gray-800">
            {appointmentData.appointment.appointmentName}
          </p>
          <button
            className="absolute top-0 right-0 border border-gray-100 bg-white w-32 h-32 rounded-[12px] cursor-pointer flex justify-center items-center"
            onClick={() => setAppointmentDrawerOpen(true)}
          >
            <PencilIcon />
          </button>
        </div>
        <div className="w-full flex gap-8 justify-center items-center">
          <div className="typo-14-regular text-gray-400 flex flex-row gap-4">
            <span>투표 마감</span>
            <span>{appointmentData.appointment.dday}</span>
          </div>
          <div className="w-1 h-12 bg-gray-300" />
          <div className="typo-14-regular text-gray-400 flex flex-row gap-4">
            <span>참여 인원</span>
            <span>{`${appointmentData.appointmentUserList.length}명`}</span>
          </div>
        </div>
      </div>
      {appointmentData.appointmentUserList.length > 0 && (
        <ParticipantList
          appointmentId={appointmentId}
          myProfile={profileData}
          isHost={isHost}
          participants={appointmentData.appointmentUserList}
        />
      )}
      <div className="w-full px-16 flex justify-between items-center">
        <p className="typo-14-regular text-gray-500">
          약속을 함께할 친구를 불러보세요!
        </p>
        <Button
          color="White"
          className="pl-4 pr-12 py-4 h-32 rounded-[12px]"
          onClick={() => setShareModalOpen(true)}
        >
          <PlusIcon />
          <span className="typo-14-regular text-gray-700">공유하기</span>
        </Button>
      </div>

      <EditAppointmentDrawer
        appointmentId={appointmentId}
        initialName={appointmentData.appointment.appointmentName}
        initialDueDate={appointmentData.appointment.appointmentDueDate}
        open={appointmentDrawerOpen}
        setOpen={setAppointmentDrawerOpen}
        isHost={isHost}
        isConfirmed={appointmentData.appointment.confirmYn === "Y"}
      />
      {/* Modal */}
      {shareModalOpen && (
        <ShareModal
          appointmentId={appointmentId}
          appointmentName={appointmentData.appointment.appointmentName}
          setOpen={setShareModalOpen}
          isHost={isHost}
        />
      )}
    </section>
  );
};

export default AppointmentInfoSection;
