"use client";

import { cn } from "@/utils/cn";
import Button from "../shared/Button";
import PlaceIcon from "./icons/PlaceIcon";
import { memo, useMemo, useState } from "react";
import PostcodePopup from "../shared/PostcodePopup";
import { Address } from "@/types/daum";
import useRegisterLocation from "@/hooks/useRegisterLocation";
import useMyVoteLocationQuery from "@/hooks/useMyVoteLocationQuery";
import LoadingSpinner from "../shared/LoadingSpinner";
import useLocationsQuery from "@/hooks/useLocationsQuery";
import VotePlaceForm from "./VotePlaceForm";
import useAppointmentUserProfileQuery from "@/hooks/useAppointmentUserProfileQuery";
import { useToast } from "@/context/ToastContext";
import PlaceViewList from "./PlaceViewList";

interface PlaceVoteCardProps {
  appointmentId: string;
  disabled?: boolean;
}

const PlaceVoteCard = ({ appointmentId, disabled }: PlaceVoteCardProps) => {
  const { toast } = useToast();

  const [mode, setMode] = useState<"VOTE" | "VIEW">("VIEW");
  const [postcodePopupOpen, setPostcodePopupOpen] = useState(false);

  const { data: profileData } = useAppointmentUserProfileQuery({
    appointmentId,
  });

  const canVote = profileData !== undefined && !disabled;
  const canAddPlace = profileData !== undefined && !disabled;

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

  /* 장소 등록 */
  const { mutate, isPending, isSuccess, reset } =
    useRegisterLocation(appointmentId);
  const addPlace = async (address: Address) => {
    mutate(
      { address },
      {
        onSuccess: () => {
          toast({ message: "등록이 완료됐어요." });
        },
        onError: () => {
          toast({ message: "등록에 실패했습니다. 잠시 후 다시 시도해주세요." });
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
                <PlaceViewList
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
                    onClick={() => setMode("VOTE")}
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
                myVotedPlaceIdList={myVotedPlaceIdList}
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
    </div>
  );
};

export default memo(PlaceVoteCard);
