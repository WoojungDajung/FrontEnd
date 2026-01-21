"use client";

import { cn } from "@/utils/cn";
import Button from "../shared/Button";
import PlaceIcon from "./PlaceIcon";
import { useMemo, useState } from "react";
import { PlaceItemForView, PlaceItemForVote } from "./PlaceItem";
import { Place } from "@/types/meeting";
import PostcodePopup from "../shared/PostcodePopup";
import { Address } from "@/types/daum";

interface PlaceVoteCardProps {
  disabled?: boolean;
}

const PlaceVoteCard = ({ disabled }: PlaceVoteCardProps) => {
  const [mode, setMode] = useState<"VOTE" | "VIEW">("VIEW");
  const [places, setPlaces] = useState<Place[]>([
    { id: "1", name: "장소명", address: "상세 주소", count: 3 },
    { id: "2", name: "장소명", address: "상세 주소", count: 2 },
    { id: "3", name: "장소명", address: "상세 주소", count: 1 },
  ]);
  const [postcodePopupOpen, setPostcodePopupOpen] = useState(false);

  const placeIdVoted = "3";

  const totalCount = useMemo(
    () => places.reduce((acc, cur) => acc + cur.count, 0),
    [places],
  );

  const openSearchAddressPopup = () => {
    setPostcodePopupOpen(true);
  };

  const addPlace = (address: Address) => {
    // 장소 등록
    console.log("장소 등록:", address);
  };

  const startVote = () => {
    setMode("VOTE");
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[24px] flex flex-col items-center gap-16 items-center py-16">
      {places.length > 0 ? (
        <>
          {mode === "VIEW" ? (
            <>
              <div className="flex flex-col gap-16">
                {places.map((place) => (
                  <PlaceItemForView
                    key={place.id}
                    place={place}
                    totalCount={6}
                    votedByMe={place.id === placeIdVoted}
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
              places={places}
              placeIdVoted={placeIdVoted}
              totalCount={totalCount}
              onCompleteVote={() => setMode("VIEW")}
            />
          )}
        </>
      ) : (
        <>
          <div className="w-310 h-104 flex flex-col gap-4 justify-center items-center">
            <PlaceIcon
              fill={
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

const VotePlace = ({
  places,
  placeIdVoted,
  totalCount,
  onCompleteVote,
}: {
  places: Place[];
  placeIdVoted?: string;
  totalCount: number;
  onCompleteVote: () => void;
}) => {
  const [selected, setSelected] = useState<string | null>(placeIdVoted ?? null);

  const onVoteItem = (placeId: string) => {
    if (placeId === selected) {
      setSelected(null);
    } else {
      setSelected(placeId);
    }
  };

  const saveVote = () => {
    // TODO: 투표 반영
    onCompleteVote();
  };

  return (
    <>
      <div className="flex flex-col gap-16">
        {places.map((place) => (
          <PlaceItemForVote
            key={place.id}
            place={place}
            onClick={() => onVoteItem(place.id)}
            voted={place.id === selected}
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
