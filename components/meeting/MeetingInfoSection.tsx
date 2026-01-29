"use client";

import { useMemo, useState } from "react";
import Button from "../shared/Button";
import PencilIcon from "./icons/PencilIcon";
import SmilingFaceIcon from "./icons/SmilngFaceIcon";
import EditProfileDrawer from "./EditProfileDrawer";
import EditMeetingDrawer from "./EditMeetingDrawer";
import PlusIcon from "./icons/PlusIcon";
import ParticipantList from "./ParticipantList";
import { Participant, Profile } from "@/types/meeting";
import ShareModal from "./ShareModal";

const MeetingInfoSection = () => {
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [meetingDrawerOpen, setMeetingDrawerOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // 예시 값
  const participants: Participant[] = useMemo(
    () => [
      { id: "1", nickName: "소연", editableYn: "Y" },
      { id: "2", nickName: "홍길동", editableYn: "N" },
      { id: "3", nickName: "니노막시무스카이저소제", editableYn: "N" },
      { id: "4", nickName: "소냐도르", editableYn: "N" },
      { id: "5", nickName: "스파르타", editableYn: "N" },
      { id: "6", nickName: "Name", editableYn: "N" },
      { id: "7", nickName: "Name", editableYn: "N" },
      { id: "8", nickName: "Name", editableYn: "N" },
      { id: "9", nickName: "Name", editableYn: "N" },
      { id: "10", nickName: "Name", editableYn: "N" },
      { id: "11", nickName: "Name", editableYn: "N" },
    ],
    [],
  );

  const myProfile: Profile | undefined = useMemo(
    () => ({
      id: "1",
      memberNickName: "소연",
    }),
    [],
  );
  const isMyMeeting = useMemo(() => {
    const target = participants.find((p) => p.id === myProfile.id);
    return target?.editableYn === "Y";
  }, [myProfile, participants]);
  const hasRegistered = myProfile !== undefined;

  return (
    <section className="py-16 flex flex-col gap-24 items-center bg-white border border-gray-100 rounded-[24px]">
      <div className="w-full px-16">
        <div className="flex justify-center relative">
          <p className="typo-20-bold text-gray-800">스터디밥먹으러</p>
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
            투표 마감일 2026.01.06
          </p>
          <div className="bg-primary-25 text-primary-400 rounded-[40px] px-8 py-4">
            D-5
          </div>
        </div>
      </div>
      {participants.length > 0 && (
        <ParticipantList myProfile={myProfile} participants={participants} />
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
          <p className="typo-14-regular text-primary-400">{`${participants.length}명의 친구들이 약속 잡는 중!`}</p>
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
