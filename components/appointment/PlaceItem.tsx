import { cn } from "@/utils/cn";
import RightChevronIcon from "../shared/icons/RightChevronIcon";
import { MouseEvent } from "react";
import { Location } from "@/types/apiResponse";
import { useAppointmentPage } from "@/context/AppointmentContext";

interface CommonItemProps {
  place: Location;
  totalCount: number;
}

interface PlaceItemProps extends CommonItemProps {
  className?: string;
  onClick?: () => void;
}

const PlaceItem = ({
  place,
  totalCount,
  className,
  onClick,
}: PlaceItemProps) => {
  const { selectPlace } = useAppointmentPage();

  const showPlaceInfoDrawer = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    selectPlace(place.id);
  };

  const voteCount = Number(place.voteCount);

  return (
    <>
      <div
        className={cn(
          "w-310 h-104 rounded-[16px] px-16 pb-16 pt-12 flex flex-col gap-4",
          className,
        )}
        onClick={onClick}
      >
        <div className="w-full">
          <div className="w-full flex justify-between">
            <div className="typo-16-regular text-gray-800 text-ellipsis">
              {place.name}
            </div>
            <button className="cursor-pointer" onClick={showPlaceInfoDrawer}>
              <RightChevronIcon
                width={24}
                height={24}
                color="var(--color-gray-500)"
              />
            </button>
          </div>
          <p className="typo-14-regular text-gray-500">{place.address}</p>
        </div>
        <div className="flex flex-col gap-4">
          <p className="typo-12-regular text-gray-500">{`투표 인원 ${voteCount}명`}</p>
          <div className="w-full h-4">
            <div
              className="h-full bg-primary-400"
              style={{ width: `${(voteCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

interface PlaceItemForViewProps extends CommonItemProps {
  votedByMe?: boolean;
}

const PlaceItemForView = ({
  place,
  votedByMe,
  totalCount,
}: PlaceItemForViewProps) => {
  return (
    <PlaceItem
      place={place}
      totalCount={totalCount}
      className={cn(
        votedByMe ? "bg-primary-25" : "bg-white",
        "border border-gray-50",
      )}
    />
  );
};

interface PlaceItemForVoteProps extends CommonItemProps {
  onClick?: () => void;
  voted: boolean;
}

const PlaceItemForVote = ({
  onClick,
  voted,
  place,
  ...props
}: PlaceItemForVoteProps) => {
  return (
    <PlaceItem
      className={cn(
        "border cursor-pointer",
        voted ? "bg-primary-25 border-primary-300" : "bg-white border-gray-300",
      )}
      onClick={onClick}
      place={place}
      {...props}
    />
  );
};

export { PlaceItemForView, PlaceItemForVote };
