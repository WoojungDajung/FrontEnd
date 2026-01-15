import { cn } from "@/utils/cn";
import Button from "../shared/Button";
import PlaceIcon from "./PlaceIcon";

interface PlaceVoteCardProps {
  disabled?: boolean;
}

const PlaceVoteCard = ({ disabled }: PlaceVoteCardProps) => {
  return (
    <div className="bg-white border border-gray-100 rounded-[24px] flex flex-col gap-16 items-center py-16">
      <div className="w-310 h-104 flex flex-col gap-4 justify-center items-center">
        <PlaceIcon
          fill={disabled ? "var(--color-gray-300)" : "var(--color-gray-500)"}
        />
        <p
          className={cn(
            "typo-14-regular",
            disabled ? "text-gray-300" : "text-gray-500"
          )}
        >
          장소를 등록해주세요.
        </p>
      </div>
      <Button size="Medium" color="White" className="w-310" disabled={disabled}>
        장소 등록하기
      </Button>
    </div>
  );
};

export default PlaceVoteCard;
