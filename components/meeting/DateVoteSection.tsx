"use client";

import PersonIcon from "./PersonIcon";
import DateVoteCard from "./DateVoteCard";

const DateVoteSection = () => {
  const currentCount = 0;
  const totalCount = 0;

  return (
    <section className="flex flex-col gap-8">
      <div className="w-full flex justify-between items-center">
        <p className="typo-16-regular text-gray-800 relative left-8">일정</p>
        <button className="px-8 py-4 rounded-[12px] flex">
          <PersonIcon />
          <p className="text-gray-700 typo-14-regular">
            <span className="text-primary-400">{currentCount}</span>/
            {totalCount}
          </p>
        </button>
      </div>
      <DateVoteCard />
    </section>
  );
};

export default DateVoteSection;
