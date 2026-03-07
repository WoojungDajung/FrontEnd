import { sendGTM } from "@/lib/google-tag-manager";
import { SubmitVoteEventData } from "@/types/gtmEventData";
import { useCallback, useEffect, useRef, useState } from "react";
import useVoteLocation from "./useVoteLocation";
import { Location } from "@/types/apiResponse";

interface useVotePlaceFormProps {
  appointmentId: string;
  myVotedPlaceIdList: number[];
  isHost: boolean;
  onSubmitSuccess: () => void;
  onSubmitError: () => void;
}

const useVotePlaceForm = ({
  appointmentId,
  myVotedPlaceIdList,
  isHost,
  onSubmitSuccess,
  onSubmitError,
}: useVotePlaceFormProps) => {
  const [selected, setSelected] = useState<number[]>(myVotedPlaceIdList);
  const originalVotedPlaceSet = useRef<Set<number>>(
    new Set(myVotedPlaceIdList),
  );
  const curVotedPlaceSet = useRef<Set<number>>(new Set());

  useEffect(() => {
    curVotedPlaceSet.current = new Set(selected);
  }, [selected]);

  const selectPlace = useCallback((placeId: number) => {
    setSelected((prev) => {
      const idx = prev.findIndex((id) => id === placeId);
      if (idx === -1) {
        // 투표
        return [...prev, placeId];
      } else {
        // 투표 취소
        const newSelected = [...prev];
        newSelected.splice(idx, 1);
        return newSelected;
      }
    });
  }, []);

  /* 투표 반영 */
  const sendGTMEvent = useCallback(() => {
    const data: SubmitVoteEventData = {
      event: "submit_vote",
      appointment_id: appointmentId,
      user_role: isHost ? "host" : "guest",
      vote_type: "place",
    };
    sendGTM(data);
  }, [appointmentId, isHost]);

  const { mutate, isPending, isSuccess, reset } =
    useVoteLocation(appointmentId);

  const submitForm = () => {
    mutate(
      { placeIdList: selected },
      {
        onError: () => {
          reset();
          onSubmitError();
        },
        onSuccess: () => {
          sendGTMEvent();
          onSubmitSuccess();
        },
      },
    );
  };

  const getPlaceItemStatus = useCallback((place: Location) => {
    const isVoted = curVotedPlaceSet.current.has(place.id);
    const isVotedAlready = originalVotedPlaceSet.current.has(place.id);
    const voteCount =
      Number(place.voteCount) + (isVoted ? 1 : 0) - (isVotedAlready ? 1 : 0);
    return { isVoted, voteCount };
  }, []);

  return {
    selectPlace,
    submitForm,
    isSubmitPending: isPending,
    isSubmitSuccess: isSuccess,
    getPlaceItemStatus
  };
};

export default useVotePlaceForm;
