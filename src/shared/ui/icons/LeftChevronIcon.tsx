import { IconProps } from "@/src/shared/ui/icons/IconProps";

const LeftChevronIcon = ({ width, height, color }: IconProps) => {
  return (
    <svg
      width={width ?? "20"}
      height={height ?? "20"}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13 15L8 10L13 5"
        stroke={color ?? "#A4A7AE"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.58333}
      />
    </svg>
  );
};

export default LeftChevronIcon;
