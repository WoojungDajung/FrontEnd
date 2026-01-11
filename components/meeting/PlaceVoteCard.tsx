import Button from "../shared/Button";
import PlaceIcon from "./PlaceIcon";

const PlaceVoteCard = () => {
  return (
    <div className="bg-white border border-gray-100 rounded-[24px] flex flex-col gap-16 items-center py-16">
      <div className="w-310 h-104 flex flex-col gap-4 justify-center items-center">
        <PlaceIcon />
        <p className="typo-14-regular text-gray-300">장소를 등록해주세요.</p>
      </div>
      <Button size="Medium" color="White" className="w-310">장소 등록하기</Button>
    </div>
  );
};

export default PlaceVoteCard;
