import { ReactNode } from "react";
import LeftChevronIcon from "./icons/LeftChevronIcon";

interface DefaultDrawerLayoutProps {
  title: string;
  close?: () => void;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

const DefaultDrawerLayout = ({
  title,
  close,
  secondaryAction,
  children,
}: DefaultDrawerLayoutProps) => {
  return (
    <div className="w-full pt-8 pb-24 px-24 relative flex flex-col">
      <div className="w-full h-56 grid grid-cols-[1fr_auto_1fr] items-center sticky top-0 left-0">
        <button onClick={close} className="w-fit mr-auto cursor-pointer">
          <LeftChevronIcon
            width={20}
            height={20}
            color="var(--color-gray-400)"
          />
        </button>
        <p className="typo-18-semibold text-gray-800">{title}</p>
        {secondaryAction && (
          <button
            className="typo-14-regular text-gray-400 w-fit ml-auto cursor-pointer"
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
      <div className="overflow-auto flex-1">{children}</div>
    </div>
  );
};

export default DefaultDrawerLayout;
