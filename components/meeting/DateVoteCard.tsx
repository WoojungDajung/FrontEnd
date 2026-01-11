import { useState } from "react";

const DateVoteCard = () => {
  const [mode, setMode] = useState<"VIEW" | "VOTE">("VIEW")

  return (
    <div className="bg-white border border-gray-100 rounded-[24px] flex flex-col gap-16 items-center pt-8 pb-16">
      {/* TODO: 캘린더 구현 */}
      <button className="button w-310 h-48">선택하기</button>
    </div>
  );
};

export default DateVoteCard;
