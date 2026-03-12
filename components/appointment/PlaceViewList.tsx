"use client";

import { Location } from "@/types/apiResponse";
import { PlaceItemForView } from "./PlaceItem";
import { memo, useMemo } from "react";

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
  const myVotedPlaceIdSet = useMemo(
    () => new Set(myVotedPlaceIdList),
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
          votedByMe={myVotedPlaceIdSet.has(place.id)}
        />
      ))}
    </div>
  );
};

export default memo(PlaceViewList);
