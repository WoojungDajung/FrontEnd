import { IconProps } from "@/types/IconProps";

const KakaoIcon = ({ width, height }: IconProps) => {
  return (
    <svg
      width={width ?? "24"}
      height={height ?? "24"}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_704_5134)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.0001 0.800781C5.37225 0.800781 0 4.95139 0 10.0705C0 13.2541 2.07788 16.0607 5.24205 17.7301L3.91072 22.5934C3.7931 23.0232 4.28457 23.3657 4.66197 23.1167L10.4978 19.2651C10.9903 19.3126 11.4908 19.3403 12.0001 19.3403C18.6274 19.3403 24 15.1899 24 10.0705C24 4.95139 18.6274 0.800781 12.0001 0.800781Z"
          fill="black"
        />
      </g>
      <defs>
        <clipPath id="clip0_704_5134">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default KakaoIcon;
