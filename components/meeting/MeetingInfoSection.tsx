"use client";

import { useMemo, useState } from "react";
import Button from "../shared/Button";
import PencilIcon from "./icons/PencilIcon";
import SmilingFaceIcon from "./icons/SmilngFaceIcon";
import EditProfileDrawer from "./EditProfileDrawer";
import EditMeetingDrawer from "./EditMeetingDrawer";
import PlusIcon from "./icons/PlusIcon";
import ParticipantList from "./ParticipantList";
import { Profile } from "@/types/meeting";
import ShareModal from "./ShareModal";
import useAppointmentQuery from "@/hooks/useAppointmentQuery";
import dayjs from "dayjs";

interface MeetingInfoSectionProps {
  appointmentId: string;
}

const MeetingInfoSection = ({ appointmentId }: MeetingInfoSectionProps) => {
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [meetingDrawerOpen, setMeetingDrawerOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const { data } = useAppointmentQuery({ appointmentId });

  const myProfile: Profile | undefined = useMemo(
    () => ({
      id: 1,
      memberNickName: "소연",
    }),
    [],
  );

  if (data === undefined) {
    return <></>;
  }

  const isMyMeeting =
    data.appointmentUserList.find((u) => u.id === myProfile.id)?.editableYn ===
    "Y";
  const hasRegistered = data.appointment.profileYn === "Y";
  const dueDateStr = dayjs(data.appointment.appointmentDueDate).format(
    "YYYY.MM.DD",
  );

  return (
    <section className="py-16 flex flex-col gap-24 items-center bg-white border border-gray-100 rounded-[24px]">
      <div className="w-full px-16">
        <div className="flex justify-center relative">
          <p className="typo-20-bold text-gray-800">
            {data.appointment.appointmentName}
          </p>
          {isMyMeeting && (
            <button
              className="absolute top-0 right-0 border border-gray-100 bg-white w-32 h-32 rounded-[12px] cursor-pointer"
              onClick={() => setMeetingDrawerOpen(true)}
            >
              <PencilIcon />
            </button>
          )}
        </div>
        <div className="w-full flex gap-8 justify-center items-center">
          <p className="typo-16-regular text-gray-600">
            {`투표 마감일 ${dueDateStr}`}
          </p>
          <div className="typo-12-regular bg-primary-25 text-primary-400 rounded-[40px] px-8 py-4">
            {data.appointment.dday}
          </div>
        </div>
      </div>
      {data.appointmentUserList.length > 0 && (
        <ParticipantList
          myProfile={myProfile}
          participants={data.appointmentUserList}
        />
      )}
      {hasRegistered ? (
        <>
          <div className="w-full px-16 flex justify-between items-center">
            <p className="typo-14-regular text-gray-500">
              약속을 함께할 친구를 불러보세요!
            </p>
            <Button
              color="White"
              className="px-8 py-4 h-32 rounded-[12px]"
              onClick={() => setShareModalOpen(true)}
            >
              <PlusIcon />
              <span className="typo-14-regular text-gray-700">공유하기</span>
            </Button>
          </div>
        </>
      ) : isMyMeeting ? (
        <>
          <div className="flex justify-center">
            <SmilingFaceIcon />
          </div>
          <Button
            size="Medium"
            color="Primary"
            onClick={() => setProfileDrawerOpen(true)}
          >
            내 정보 입력하기
          </Button>
        </>
      ) : (
        <div className="flex flex-col gap-4 items-center">
          <p className="typo-14-regular text-primary-400">{`${data.appointmentUserList.length}명의 친구들이 약속 잡는 중!`}</p>
          <Button size="Medium" color="Primary">
            참여하기
          </Button>
        </div>
      )}

      {/* Drawer */}
      <EditProfileDrawer
        open={profileDrawerOpen}
        setOpen={setProfileDrawerOpen}
      />
      <EditMeetingDrawer
        initialMeetingName="Text"
        initialDeadline={new Date()}
        open={meetingDrawerOpen}
        setOpen={setMeetingDrawerOpen}
      />
      {/* Modal */}
      <ShareModal open={shareModalOpen} setOpen={setShareModalOpen} />
    </section>
  );
};

export default MeetingInfoSection;
