import { Participant, Profile } from "@/types/meeting";
import { MouseEvent, useState } from "react";
import PencilIcon from "./PencilIcon";
// import DownChevronIcon from "./DownChevronIcon";
// import UpChevronIcon from "./UpChevronIcon";
import EditProfileDrawer from "./EditProfileDrawer";
import ParticipantBadge from "./ParticipantBadge";

interface ParticipantListProps {
  myProfile?: Profile;
  participants: Participant[];
}

const ParticipantList = ({ myProfile, participants }: ParticipantListProps) => {
  // const [folded, setFolded] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  const me = participants.find((p) => p.id === myProfile?.id);
  const others = participants.filter((p) => p.id !== myProfile?.id);

  const onClickEditProfileButton = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setProfileDrawerOpen(true);
  };

  // 선택된 User의 투표 상태를 보여주기 기능 관련 값
  const selectedUserId: string | undefined = undefined;
  const onClickBadge = (userId: string) => {
    // 해당 user 선택
  };

  return (
    <>
      <div className="w-full flex flex-col gap-8 items-center">
        <div className="w-full px-16 flex flex-wrap gap-8 justify-center">
          {me && (
            <ParticipantBadge
              className="bg-primary-25"
              onClick={() => onClickBadge(me.id)}
              selected={me.id === selectedUserId}
            >
              <span className="typo-14-regular text-gray-800">
                {me.nickName}
              </span>
              <button className="button" onClick={onClickEditProfileButton}>
                <PencilIcon width={16} height={16} />
              </button>
            </ParticipantBadge>
          )}
          {others.map((participant) => (
            <ParticipantBadge
              key={participant.id}
              className="bg-gray-100"
              onClick={() => onClickBadge(participant.id)}
              selected={participant.id === selectedUserId}
            >
              <span className="typo-14-regular text-gray-800">
                {participant.nickName}
              </span>
            </ParticipantBadge>
          ))}
        </div>
        {/* {folded ? <DownChevronIcon /> : <UpChevronIcon />} */}
      </div>

      {me && (
        <EditProfileDrawer
          initialProfile={myProfile}
          open={profileDrawerOpen}
          setOpen={setProfileDrawerOpen}
        />
      )}
    </>
  );
};

export default ParticipantList;
