"use client";

import DateVoteCard from "./DateVoteCard";
import CountButton from "./CountButton";

const DateVoteSection = () => {
  return (
    <section className="flex flex-col gap-8">
      <div className="w-full flex justify-between items-center">
        <p className="typo-16-regular text-gray-800 relative left-8">일정</p>
        <CountButton currentCount={0} totalCount={0} onClick={() => {}} />
      </div>
      <DateVoteCard />
    </section>
  );
};

export default DateVoteSection;
