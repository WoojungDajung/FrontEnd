import { cn } from "@/utils/cn";
import { ReactNode } from "react";

interface ParticipantBadgeProps {
  children: ReactNode;
  onClick: () => void;
  selected: boolean;
  className?: string;
}

const ParticipantBadge = ({
  children,
  onClick,
  selected,
  className,
}: ParticipantBadgeProps) => {
  return (
    <div
      className={cn(
        "px-12 py-8 rounded-[100px] flex gap-4 items-center cursor-pointer",
        selected && "border border-primary-400",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default ParticipantBadge;
