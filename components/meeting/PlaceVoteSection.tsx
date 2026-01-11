import CountButton from "./CountButton";
import PlaceVoteCard from "./PlaceVoteCard";

const PlaceVoteSection = () => {
  return (
    <section className="flex flex-col gap-8">
      <div className="w-full flex justify-between items-center">
        <p className="typo-16-regular text-gray-800 relative left-8">장소</p>
        <CountButton currentCount={0} totalCount={0} onClick={() => {}} />
      </div>
      <PlaceVoteCard />
    </section>
  );
};

export default PlaceVoteSection;
