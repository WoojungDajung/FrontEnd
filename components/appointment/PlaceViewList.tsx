"use client";

import { Location } from "@/types/apiResponse";
import { PlaceItemForView } from "./PlaceItem";
import { memo, useCallback } from "react";

interface PlaceViewListProps {
  locationList: Location[];
  totalCount: number;
  myVotedPlaceIdList: number[];
}

const PlaceViewList = ({
  locationList,
  totalCount,
  myVotedPlaceIdList,
}: PlaceViewListProps) => {
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
          voteCount={Number(place.voteCount)}
          totalCount={totalCount}
          votedByMe={isMyVoteLocation(place.id)}
        />
      ))}
    </div>
  );
};

export default memo(PlaceViewList);
