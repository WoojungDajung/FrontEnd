import {
  memo,
  MouseEvent,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PencilIcon from "./icons/PencilIcon";
import DownChevronIcon from "../../ui/icons/DownChevronIcon";
import UpChevronIcon from "../../ui/icons/UpChevronIcon";
import ParticipantBadge from "./ParticipantBadge";
import { AppointmentUser } from "@/src/entities/appointment/types";
import { MemberProfile } from "../../types";
import { useAppointmentPage } from "../../context/AppointmentContext";
import EditProfileDrawer from "./EditProfileDrawer";

interface ParticipantListProps {
  appointmentId: string;
  isHost: boolean;
  myProfile: MemberProfile;
  participants: AppointmentUser[];
}

const ParticipantList = ({
  appointmentId,
  isHost,
  myProfile,
  participants,
}: ParticipantListProps) => {
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  const { me, others } = useMemo(() => {
    let me: AppointmentUser | undefined;
    const others: AppointmentUser[] = [];

    for (const participant of participants) {
      if (participant.id === myProfile.id) {
        me = participant;
      } else {
        others.push(participant);
      }
    }

    return { me, others };
  }, [participants, myProfile]);

  const onClickEditProfileButton = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setProfileDrawerOpen(true);
  };

  /* 선택된 User의 투표 상태를 보여주기 기능 */
  const { selectedParticipantId, selectParticipant } = useAppointmentPage();

  const onClickBadge = (userId: number) => {
    if (userId === selectedParticipantId) {
      selectParticipant(null);
    } else {
      selectParticipant(userId);
    }
  };

  /* 사용자 목록 2줄까지만 보여주기 */
  const containerRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [canToggle, setCanToggle] = useState(false);
  const [containerMaxHeight, setContainerMaxHeight] = useState(0);

  const compute = useCallback(
    (
      container: HTMLDivElement,
      rowLimit: number,
    ): { canToggle: boolean; containerHeight: number } => {
      const items = Array.from(container.children) as HTMLElement[];
      if (items.length === 0) return { canToggle: false, containerHeight: 0 };

      const rowTops: number[] = [];
      let maxItemHeight = 0;

      for (let i = 0; i < items.length; i++) {
        const el = items[i];
        const top = el.offsetTop;

        if (rowTops.length === 0 || top !== rowTops[rowTops.length - 1]) {
          rowTops.push(top);

          if (rowTops.length > rowLimit) {
            return {
              canToggle: true,
              containerHeight:
                rowTops[rowLimit - 1] - rowTops[0] + maxItemHeight,
            };
          }
        }

        if (rowTops.length === rowLimit && top === rowTops[rowLimit - 1]) {
          maxItemHeight = Math.max(maxItemHeight, el.offsetHeight);
        }
      }

      // 2줄 이내
      return { canToggle: false, containerHeight: container.scrollHeight };
    },
    [],
  );

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const { canToggle, containerHeight } = compute(containerRef.current, 2);
    setCanToggle(canToggle);
    setContainerMaxHeight(containerHeight);
  }, [participants, compute]);

  return (
    <>
      <div className="w-full flex flex-col gap-8 items-center">
        <div
          ref={containerRef}
          className="w-full px-16 flex flex-wrap gap-8 justify-center"
          style={
            expanded
              ? undefined
              : { maxHeight: `${containerMaxHeight}px`, overflow: "hidden" }
          }
        >
          {me && (
            <ParticipantBadge
              className="bg-primary-25"
              onClick={() => onClickBadge(me.id)}
              selected={me.id === selectedParticipantId}
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
              selected={participant.id === selectedParticipantId}
            >
              <span className="typo-14-regular text-gray-800">
                {participant.nickName}
              </span>
            </ParticipantBadge>
          ))}
        </div>
        {canToggle &&
          (expanded ? (
            <button onClick={() => setExpanded(false)} className="button">
              <UpChevronIcon
                width={20}
                height={20}
                color="var(--color-gray-400)"
              />
            </button>
          ) : (
            <button onClick={() => setExpanded(true)} className="button">
              <DownChevronIcon
                width={20}
                height={20}
                color="var(--color-gray-400)"
              />
            </button>
          ))}
      </div>

      {me && myProfile && (
        <EditProfileDrawer
          appointmentId={appointmentId}
          initialProfile={myProfile}
          canLeaveAppointment={!isHost}
          open={profileDrawerOpen}
          setOpen={setProfileDrawerOpen}
        />
      )}
    </>
  );
};

export default memo(ParticipantList);
