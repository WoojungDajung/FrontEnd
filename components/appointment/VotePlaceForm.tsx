import { Location } from "@/types/apiResponse";
import { PlaceItemForVote } from "./PlaceItem";
import Button from "../shared/Button";
import useVoteLocation from "@/hooks/useVoteLocation";
import { useCallback, useState } from "react";
import LoadingSpinner from "../shared/LoadingSpinner";
import { useToast } from "@/context/ToastContext";
import { sendGTM } from "@/lib/google-tag-manager";
import { SubmitVoteEventData } from "@/types/gtmEventData";

interface VotePlaceFormProps {
  places: Location[];
  myVotedPlaceIdList: number[];
  totalCount: number;
  appointmentId: string;
  isHost: boolean;
  onCompleteVote: () => void;
}

const VotePlaceForm = ({
  places,
  myVotedPlaceIdList,
  totalCount,
  appointmentId,
  isHost,
  onCompleteVote,
}: VotePlaceFormProps) => {
  const { toast } = useToast();

  const [selected, setSelected] = useState<number[]>(myVotedPlaceIdList);

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

  /* 투표 반영 */
  const sendGTMEvent = useCallback(() => {
    const data: SubmitVoteEventData= {
      event: "submit_vote",
      appointment_id: appointmentId,
      user_role: isHost ? "host" : "guest",
      vote_type: "place",
    }
    sendGTM({

    });
  }, [appointmentId,isHost]);

  const { mutate, isPending, isSuccess, reset } =
    useVoteLocation(appointmentId);
  const saveVote = () => {
    mutate(
      { placeIdList: selected },
      {
        onError: () => {
          toast({ message: "투표에 실패했습니다. 잠시 후 다시 시도해주세요." });
          reset();
        },
        onSettled: () => {
          toast({ message: "투표가 완료됐어요." });
          sendGTMEvent();
          onCompleteVote();
        },
      },
    );
  };

  const isVoted = (locationId: number) => selected.includes(locationId);
  const isVotedAlready = (locationId: number) =>
    myVotedPlaceIdList.includes(locationId);

  return (
    <>
      <div className="flex flex-col gap-16">
        {places.map((place) => {
          const voted = isVoted(place.id);
          const voteCount =
            Number(place.voteCount) +
            (voted ? 1 : 0) -
            (isVotedAlready(place.id) ? 1 : 0);

          return (
            <PlaceItemForVote
              key={place.id}
              place={place}
              onClick={() => onClickItem(place.id)}
              voted={voted}
              voteCount={voteCount}
              totalCount={totalCount}
            />
          );
        })}
      </div>

      <div className="w-full px-16 flex justify-between">
        <Button size="Small" color="White" disabled>
          장소 등록하기
        </Button>
        <Button size="Small" color="Primary" onClick={saveVote}>
          저장하기
        </Button>
      </div>

      {(isPending || isSuccess) && (
        <div className="absolute inset-0 w-full h-full bg-white/40 grid place-items-center">
          <LoadingSpinner
            size={25}
            open={isPending || isSuccess}
            success={isSuccess}
            onClose={() => reset()}
          />
        </div>
      )}
    </>
  );
};

export default VotePlaceForm;
