import { IconProps } from "@/src/shared/ui/icons/IconProps";

const RightChevronIcon = ({ width, height, color }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ?? "24"}
      height={height ?? "24"}
      fill="none"
    >
      <path
        stroke={color ?? "var(--color-gray-500)"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.583}
        d="m9 18 6-6-6-6"
      />
    </svg>
  );
};

export default RightChevronIcon;
