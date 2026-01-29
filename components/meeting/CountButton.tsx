import PersonIcon from "./icons/PersonIcon";

interface CountButtonProps {
  currentCount: number;
  totalCount: number;
  onClick: () => void;
}

const CountButton = ({
  currentCount,
  totalCount,
  onClick,
}: CountButtonProps) => {
  return (
    <button className="px-8 py-4 border border-gray-100 rounded-[12px] flex cursor-pointer bg-white hover:bg-gray-200">
      <PersonIcon />
      <p className="text-gray-700 typo-14-regular">
        <span className="text-primary-400">{currentCount}</span>/{totalCount}
      </p>
    </button>
  );
};

export default CountButton;
