"use client";

import { cn } from "@/utils/cn";
import Button from "../shared/Button";
import PlaceIcon from "./icons/PlaceIcon";
import { useCallback, useState } from "react";
import { PlaceItemForView, PlaceItemForVote } from "./PlaceItem";
import PostcodePopup from "../shared/PostcodePopup";
import { Address } from "@/types/daum";
import { Location } from "@/types/apiResponse";
import useRegisterLocation from "@/hooks/useRegisterLocation";
import useMyVoteLocationQuery from "@/hooks/useMyVoteLocationQuery";

interface PlaceVoteCardProps {
  appointmentId: string;
  locations: Location[];
  totalCount: number; // 총 인원 수
  disabled?: boolean;
}

const PlaceVoteCard = ({
  appointmentId,
  locations,
  totalCount,
  disabled,
}: PlaceVoteCardProps) => {
  const [mode, setMode] = useState<"VOTE" | "VIEW">("VIEW");

  const [postcodePopupOpen, setPostcodePopupOpen] = useState(false);

  /* 나의 투표 */
  const { data: myVotes } = useMyVoteLocationQuery(appointmentId);

  const isMyVoteLocation = useCallback(
    (locationId: number) =>
      myVotes?.find((vote) => vote.id === locationId) !== undefined,
    [myVotes],
  );

  const openSearchAddressPopup = () => {
    setPostcodePopupOpen(true);
  };

  const startVote = () => {
    setMode("VOTE");
  };

  /* 장소 등록 */
  const { mutate } = useRegisterLocation(appointmentId);
  const addPlace = async (address: Address) => {
    mutate(
      { address },
      {
        onError: () => {
          alert("장소 등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
        },
      },
    );
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[24px] flex flex-col items-center gap-16 items-center py-16">
      {locations.length > 0 ? (
        <>
          {mode === "VIEW" ? (
            <>
              <div className="flex flex-col gap-16">
                {locations.map((place) => (
                  <PlaceItemForView
                    key={place.id}
                    place={place}
                    appointmentId={appointmentId}
                    totalCount={totalCount}
                    votedByMe={isMyVoteLocation(place.id)}
                  />
                ))}
              </div>
              <div className="w-full px-16 flex justify-between">
                <Button
                  size="Small"
                  color="White"
                  onClick={openSearchAddressPopup}
                  disabled={disabled}
                >
                  장소 등록하기
                </Button>
                <Button
                  size="Small"
                  color="Primary"
                  onClick={startVote}
                  disabled={disabled}
                >
                  투표하기
                </Button>
              </div>
            </>
          ) : (
            <VotePlace
              places={locations}
              myVoteLocationIds={myVotes?.map((vote) => vote.id) ?? []}
              totalCount={totalCount}
              appointmentId={appointmentId}
              onCompleteVote={() => setMode("VIEW")}
            />
          )}
        </>
      ) : (
        <>
          <div className="w-310 h-104 flex flex-col gap-4 justify-center items-center">
            <PlaceIcon
              width={24}
              height={24}
              color={
                disabled ? "var(--color-gray-300)" : "var(--color-gray-500)"
              }
            />
            <p
              className={cn(
                "typo-14-regular",
                disabled ? "text-gray-300" : "text-gray-500",
              )}
            >
              장소를 등록해주세요.
            </p>
          </div>
          <Button
            size="Medium"
            color="White"
            disabled={disabled}
            onClick={openSearchAddressPopup}
          >
            장소 등록하기
          </Button>
        </>
      )}

      <PostcodePopup
        open={postcodePopupOpen}
        setOpen={setPostcodePopupOpen}
        onComplete={addPlace}
      />
    </div>
  );
};

interface VotePlaceProps {
  places: Location[];
  myVoteLocationIds: number[];
  totalCount: number;
  appointmentId: string;
  onCompleteVote: () => void;
}

const VotePlace = ({
  places,
  myVoteLocationIds,
  totalCount,
  appointmentId,
  onCompleteVote,
}: VotePlaceProps) => {
  const [selected, setSelected] = useState<number[]>(myVoteLocationIds);

  const onClickItem = (placeId: number) => {
    const idx = selected.findIndex((id) => id === placeId);
    if (idx === -1) {
      // 투표
      setSelected([...selected, placeId]);
    } else {
      // 투표 취소
      const newSelected = [...selected];
      newSelected.splice(idx, 1);
      setSelected(newSelected);
    }
  };

  const saveVote = () => {
    // TODO: 투표 반영
    onCompleteVote();
  };

  const isVoted = (locationId: number) => selected.includes(locationId);

  return (
    <>
      <div className="flex flex-col gap-16">
        {places.map((place) => (
          <PlaceItemForVote
            key={place.id}
            place={place}
            appointmentId={appointmentId}
            onClick={() => onClickItem(place.id)}
            voted={isVoted(place.id)}
            totalCount={totalCount}
          />
        ))}
      </div>

      <div className="w-full px-16 flex justify-between">
        <Button size="Small" color="White" disabled>
          장소 등록하기
        </Button>
        <Button size="Small" color="Primary" onClick={saveVote}>
          저장하기
        </Button>
      </div>
    </>
  );
};

export default PlaceVoteCard;
