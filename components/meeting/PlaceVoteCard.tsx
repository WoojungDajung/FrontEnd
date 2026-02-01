"use client";

import { cn } from "@/utils/cn";
import Button from "../shared/Button";
import PlaceIcon from "./icons/PlaceIcon";
import { useState } from "react";
import { PlaceItemForView, PlaceItemForVote } from "./PlaceItem";
import PostcodePopup from "../shared/PostcodePopup";
import { Address } from "@/types/daum";
import { getAddressLngLat } from "@/api/kakao-local";
import { useMutation } from "@tanstack/react-query";
import { registerLocation } from "@/api/location";
import { Location } from "@/types/apiResponse";

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

  const placeIdVoted = 3;

  const openSearchAddressPopup = () => {
    setPostcodePopupOpen(true);
  };

  const startVote = () => {
    setMode("VOTE");
  };

  /* 장소 등록 */
  // TODO: isPending 시 로딩 표시
  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      appointmentId,
      address,
    }: {
      appointmentId: string;
      address: Address;
    }) => {
      const placeName =
        address.buildingName !== "" ? address.buildingName : address.address;
      // 주소 좌표(경도,위도) 변환
      const { longitude, latitude } = await getAddressLngLat(address.address);
      // 장소 등록
      await registerLocation(
        appointmentId,
        placeName,
        address.address,
        latitude,
        longitude,
      );
    },
    onError: () => {
      alert("장소 등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
    },
    onSuccess: () => {
      // TODO: 장소 목록 조회 쿼리 무효화
    },
  });

  const addPlace = async (address: Address) => {
    mutate({ appointmentId, address });
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
                    totalCount={totalCount}
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
              places={locations}
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

const VotePlace = ({
  places,
  placeIdVoted,
  totalCount,
  onCompleteVote,
}: {
  places: Location[];
  placeIdVoted?: number;
  totalCount: number;
  onCompleteVote: () => void;
}) => {
  const [selected, setSelected] = useState<number | null>(placeIdVoted ?? null);

  const onVoteItem = (placeId: number) => {
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
