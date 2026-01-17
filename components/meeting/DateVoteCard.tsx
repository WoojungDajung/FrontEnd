import { useState } from "react";
import Button from "../shared/Button";

const DateVoteCard = () => {
  const [mode, setMode] = useState<"VIEW" | "VOTE">("VIEW")

  return (
    <div className="bg-white border border-gray-100 rounded-[24px] flex flex-col gap-16 items-center pt-8 pb-16">
      {/* TODO: 캘린더 구현 */}
      <Button size="Medium" color="Primary">선택하기</Button>
    </div>
  );
};

export default DateVoteCard;
