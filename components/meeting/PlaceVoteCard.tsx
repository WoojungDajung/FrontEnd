"use client";

import { cn } from "@/utils/cn";
import Button from "../shared/Button";
import PlaceIcon from "./icons/PlaceIcon";
import { useCallback, useMemo, useState } from "react";
import { PlaceItemForView } from "./PlaceItem";
import PostcodePopup from "../shared/PostcodePopup";
import { Address } from "@/types/daum";
import { Location } from "@/types/apiResponse";
import useRegisterLocation from "@/hooks/useRegisterLocation";
import useMyVoteLocationQuery from "@/hooks/useMyVoteLocationQuery";
import LoadingSpinner from "../shared/LoadingSpinner";
import PlaceInfoDrawer from "./PlaceInfoDrawer";
import useLocationsQuery from "@/hooks/useLocationsQuery";
import VotePlaceForm from "./VotePlaceForm";
import useAppointmentUserProfileQuery from "@/hooks/useAppointmentUserProfileQuery";

interface PlaceVoteCardProps {
  appointmentId: string;
  disabled?: boolean;
}

const PlaceVoteCard = ({ appointmentId, disabled }: PlaceVoteCardProps) => {
  const [mode, setMode] = useState<"VOTE" | "VIEW">("VIEW");

  const [postcodePopupOpen, setPostcodePopupOpen] = useState(false);

  // 사용자의 프로필 (프로필 입력 전엔 nickName, startingPlace가 null, id는 부여됨)
  const { data: profileData } = useAppointmentUserProfileQuery({
    appointmentId,
  });

  const isRegistered =
    profileData !== undefined &&
    profileData !== null &&
    profileData?.memberNickName !== null;

  const canVote = isRegistered && !disabled;
  const canAddPlace = isRegistered && !disabled;

  // 장소 목록 및 투표 현황
  const { data, isFetching } = useLocationsQuery({
    appointmentId,
  });

  const totalCount = useMemo(() => {
    if (data === undefined) return 0;
    const [_, tc] = data.memberVoteRatio.split("/");
    return Number(tc);
  }, [data]);

  /* 나의 투표 */
  const { data: myVotes } = useMyVoteLocationQuery(appointmentId);

  const myVotedPlaceIdList = useMemo(
    () => myVotes?.map((vote) => vote.id) ?? [],
    [myVotes],
  );

  const openSearchAddressPopup = () => {
    setPostcodePopupOpen(true);
  };

  const startVote = () => {
    setMode("VOTE");
  };

  /* 장소 등록 */
  const { mutate, isPending, isSuccess, reset } =
    useRegisterLocation(appointmentId);
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
    <div className="relative bg-white border border-gray-100 rounded-[24px] flex flex-col items-center gap-16 items-center py-16">
      {data ? (
        /* 장소 데이터가 있는 경우 */
        data.locationList.length > 0 ? (
          <>
            {mode === "VIEW" ? (
              <>
                <ViewPlaceList
                  locationList={data.locationList}
                  totalCount={totalCount}
                  myVotedPlaceIdList={myVotedPlaceIdList}
                />
                <div className="w-full px-16 flex justify-between">
                  <Button
                    size="Small"
                    color="White"
                    onClick={openSearchAddressPopup}
                    disabled={!canAddPlace}
                  >
                    장소 등록하기
                  </Button>
                  <Button
                    size="Small"
                    color="Primary"
                    onClick={startVote}
                    disabled={!canVote}
                  >
                    투표하기
                  </Button>
                </div>
              </>
            ) : (
              /* mode === "VOTE" (장소 투표 모드) */
              <VotePlaceForm
                places={data.locationList}
                myVoteLocationIds={myVotes?.map((vote) => vote.id) ?? []}
                totalCount={totalCount}
                appointmentId={appointmentId}
                onCompleteVote={() => setMode("VIEW")}
              />
            )}
          </>
        ) : (
          /* 등록된 장소가 하나도 없을 때 */
          <>
            <div className="w-310 h-104 flex flex-col gap-4 justify-center items-center">
              <PlaceIcon
                width={24}
                height={24}
                color={
                  canAddPlace
                    ? "var(--color-gray-500)"
                    : "var(--color-gray-300)"
                }
              />
              <p
                className={cn(
                  "typo-14-regular",
                  canAddPlace ? "text-gray-500" : "text-gray-300",
                )}
              >
                장소를 등록해주세요.
              </p>
            </div>
            <Button
              size="Medium"
              color="White"
              disabled={!canAddPlace}
              onClick={openSearchAddressPopup}
            >
              장소 등록하기
            </Button>
          </>
        )
      ) : (
        /* data === undefined (데이터 로딩 중 or 에러) */
        <div className="w-full h-200 grid place-items-center">
          <LoadingSpinner size={25} open={true} />
        </div>
      )}

      <PostcodePopup
        open={postcodePopupOpen}
        setOpen={setPostcodePopupOpen}
        onComplete={addPlace}
      />

      {(isPending || isSuccess) && (
        <div className="absolute inset-0 grid place-items-center bg-white/40">
          <LoadingSpinner
            size={25}
            open={isPending || isSuccess}
            success={isSuccess}
            onClose={() => reset()}
          />
        </div>
      )}

      <PlaceInfoDrawer appointmentId={appointmentId} deletable={canAddPlace} />
    </div>
  );
};

interface ViewPlaceListProps {
  locationList: Location[];
  totalCount: number;
  myVotedPlaceIdList: number[];
}

const ViewPlaceList = ({
  locationList,
  totalCount,
  myVotedPlaceIdList,
}: ViewPlaceListProps) => {
  const isMyVoteLocation = useCallback(
    (locationId: number) =>
      myVotedPlaceIdList.find((voteId) => voteId === locationId) !== undefined,
    [myVotedPlaceIdList],
  );
  return (
    <div className="flex flex-col gap-16">
      {locationList.map((place) => (
        <PlaceItemForView
          key={place.id}
          place={place}
          totalCount={totalCount}
          votedByMe={isMyVoteLocation(place.id)}
        />
      ))}
    </div>
  );
};

export default PlaceVoteCard;
