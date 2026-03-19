import { IconProps } from "@/src/shared/ui/icons/IconProps";

const DownChevronIcon = ({ width, height, color }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ?? "20"}
      height={height ?? "20"}
      fill="none"
    >
      <path
        stroke={color ?? "#A4A7AE"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.583}
        d="m15 9-5 5-5-5"
      />
    </svg>
  );
};

export default DownChevronIcon;
