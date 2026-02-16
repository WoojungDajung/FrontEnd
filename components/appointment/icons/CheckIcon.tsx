import { IconProps } from "@/types/IconProps";

const CheckIcon = ({ width, height, color }: IconProps) => {
  return (
    <svg
      width={width ?? "24"}
      height={height ?? "24"}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask
        id="mask0_824_7978"
        style={{
          maskType: "alpha",
        }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="24"
        height="24"
      >
        <rect width="24" height="24" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_824_7978)">
        <path
          d="M11.2677 16.2475C10.8741 16.6579 10.2179 16.6579 9.82428 16.2475L6.54451 12.8276C6.24017 12.5103 6.24017 12.0094 6.54451 11.6921C6.86738 11.3555 7.40563 11.3555 7.7285 11.6921L10.546 14.6299L17.2715 7.61727C17.5944 7.28062 18.1326 7.28062 18.4555 7.61728C18.7598 7.9346 18.7598 8.43546 18.4555 8.75279L11.2677 16.2475Z"
          fill={color ?? "#0EBC7F"}
        />
      </g>
    </svg>
  );
};

export default CheckIcon;
