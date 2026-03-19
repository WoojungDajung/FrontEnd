import { IconProps } from "@/src/shared/ui/icons/IconProps";

const PencilIcon = ({ width, height }: IconProps) => {
  return (
    <svg
      width={width ?? "32"}
      height={height ?? "32"}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask
        id="mask0_193_12645"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="32"
        height="32"
      >
        <rect width="32" height="32" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_193_12645)">
        <path
          d="M10 22H11.4L19.2 14.225L17.775 12.8L10 20.6V22ZM8 24V19.75L19.2 8.575C19.3833 8.39167 19.5958 8.25 19.8375 8.15C20.0792 8.05 20.3333 8 20.6 8C20.8667 8 21.125 8.05 21.375 8.15C21.625 8.25 21.85 8.4 22.05 8.6L23.425 10C23.625 10.1833 23.7708 10.4 23.8625 10.65C23.9542 10.9 24 11.1583 24 11.425C24 11.675 23.9542 11.9208 23.8625 12.1625C23.7708 12.4042 23.625 12.625 23.425 12.825L12.25 24H8Z"
          fill="var(--color-gray-500)"
        />
      </g>
    </svg>
  );
};

export default PencilIcon;
