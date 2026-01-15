import CountButton from "./CountButton";
import PlaceVoteCard from "./PlaceVoteCard";

const PlaceVoteSection = () => {
  // 프로필 등록 여부 -> TODO: 추후에 수정
  const isRegistered = false;

  return (
    <section className="flex flex-col gap-8">
      <div className="w-full flex justify-between items-center">
        <p className="typo-16-regular text-gray-800 relative left-8">장소</p>
        <CountButton currentCount={0} totalCount={0} onClick={() => {}} />
      </div>
      <PlaceVoteCard disabled={!isRegistered} />
    </section>
  );
};

export default PlaceVoteSection;
