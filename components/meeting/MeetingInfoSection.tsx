"use client";

import { useState } from "react";
import Button from "../shared/Button";
import PencilIcon from "./PencilIcon";
import SmilingFaceIcon from "./SmilngFaceIcon";
import EditProfileDrawer from "./EditProfileDrawer";
import EditMeetingDrawer from "./EditMeetingDrawer";

const MeetingInfoSection = () => {
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [meetingDrawerOpen, setMeetingDrawerOpen] = useState(false);

  const isMyMeeting = true;

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
      <div className="flex justify-center">
        <SmilingFaceIcon />
      </div>
      <Button
        size="Medium"
        color="Primary"
        className="w-310"
        onClick={() => setProfileDrawerOpen(true)}
      >
        내 정보 입력하기
      </Button>

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
    </section>
  );
};

export default MeetingInfoSection;
