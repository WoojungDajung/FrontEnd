import { Location } from "@/types/apiResponse";
import { PlaceItemForVote } from "./PlaceItem";
import Button from "../shared/Button";
import { useCallback } from "react";
import LoadingSpinner from "../shared/LoadingSpinner";
import useVotePlaceForm from "@/hooks/useVotePlaceForm";
import { useToastStore } from "@/store/toastStore";

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
  const toast = useToastStore((state) => state.toast);

  const onSubmitSuccess = useCallback(() => {
    toast({ message: "투표가 완료됐어요." });
    onCompleteVote();
  }, [toast, onCompleteVote]);
  const onSubmitError = useCallback(() => {
    toast({ message: "투표에 실패했습니다. 잠시 후 다시 시도해주세요." });
  }, [toast]);

  const {
    selectPlace,
    submitForm,
    isSubmitPending,
    isSubmitSuccess,
    getPlaceItemStatus,
  } = useVotePlaceForm({
    appointmentId,
    myVotedPlaceIdList,
    isHost,
    onSubmitSuccess,
    onSubmitError,
  });

  const onClickSubmitButton = () => {
    submitForm();
  };

  const showLoading = isSubmitPending || isSubmitSuccess;

  return (
    <>
      <div className="flex flex-col gap-16">
        {places.map((place) => {
          const { isVoted, voteCount } = getPlaceItemStatus(place);

          return (
            <PlaceItemForVote
              key={place.id}
              place={place}
              onClick={() => selectPlace(place.id)}
              voted={isVoted}
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
        <Button size="Small" color="Primary" onClick={onClickSubmitButton}>
          저장하기
        </Button>
      </div>

      {showLoading && (
        <div className="absolute inset-0 w-full h-full bg-white/40 grid place-items-center">
          <LoadingSpinner size={25} open success={isSubmitSuccess} />
        </div>
      )}
    </>
  );
};

export default VotePlaceForm;
