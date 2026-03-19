import { IconProps } from "@/src/shared/ui/icons/IconProps";

const ThumbUpIcon = ({ width, height, color }: IconProps) => {
  return (
    <svg
      width={width ?? "16"}
      height={height ?? "16"}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask
        id="mask0_824_7180"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="16"
        height="16"
      >
        <rect width="16" height="16" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_824_7180)">
        <path
          d="M10.619 12.5H5.38095V6L8.71429 2.5L9.30952 3.125C9.36508 3.18333 9.41071 3.2625 9.44643 3.3625C9.48214 3.4625 9.5 3.55833 9.5 3.65V3.825L8.97619 6H12.0476C12.3016 6 12.5238 6.1 12.7143 6.3C12.9048 6.5 13 6.73333 13 7V8C13 8.05833 12.9921 8.12083 12.9762 8.1875C12.9603 8.25417 12.9444 8.31667 12.9286 8.375L11.5 11.9C11.4286 12.0667 11.3095 12.2083 11.1429 12.325C10.9762 12.4417 10.8016 12.5 10.619 12.5ZM6.33333 11.5H10.619L12.0476 8V7H7.7619L8.40476 4.25L6.33333 6.425V11.5ZM5.38095 6V7H3.95238V11.5H5.38095V12.5H3V6H5.38095Z"
          fill={color ?? "#39C896"}
        />
      </g>
    </svg>
  );
};

export default ThumbUpIcon;
