import { Location } from "@/types/apiResponse";
import { PlaceItemForVote } from "./PlaceItem";
import Button from "../shared/Button";
import useVoteLocation from "@/hooks/useVoteLocation";
import { useState } from "react";
import LoadingSpinner from "../shared/LoadingSpinner";

interface VotePlaceFormProps {
  places: Location[];
  myVoteLocationIds: number[];
  totalCount: number;
  appointmentId: string;
  onCompleteVote: () => void;
}

const VotePlaceForm = ({
  places,
  myVoteLocationIds,
  totalCount,
  appointmentId,
  onCompleteVote,
}: VotePlaceFormProps) => {
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

  /* 투표 반영 */
  const { mutate, isPending, isSuccess, reset } =
    useVoteLocation(appointmentId);
  const saveVote = () => {
    mutate(
      { placeIdList: selected },
      {
        onError: () => {
          alert("투표 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
        },
        onSettled: () => {
          onCompleteVote();
        },
      },
    );
  };

  const isVoted = (locationId: number) => selected.includes(locationId);

  return (
    <>
      <div className="flex flex-col gap-16">
        {places.map((place) => (
          <PlaceItemForVote
            key={place.id}
            place={place}
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
