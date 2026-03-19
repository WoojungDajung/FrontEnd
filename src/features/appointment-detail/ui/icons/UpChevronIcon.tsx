import { IconProps } from "@/src/shared/ui/icons/IconProps";

const UpChevronIcon = ({ width, height, color }: IconProps) => {
  return (
    <svg
      width={width ?? "20"}
      height={height ?? "20"}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15 11L10 6L5 11"
        stroke={color ?? "#A4A7AE"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.583}
      />
    </svg>
  );
};

export default UpChevronIcon;
