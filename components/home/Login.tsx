"use client";

import { getAuthorizationUrl } from "@/lib/auth/kakao";
import KakaoIcon from "../shared/icons/KakaoIcon";
import { useRouter } from "next/navigation";

interface LoginProps {
  next?: string; // 로그인 후 돌아갈 경로
}

const Login = ({ next }: LoginProps) => {
  const router = useRouter();

  const onClickButton = () => {
    router.push(getAuthorizationUrl(next));
  };

  return (
    <div>
      <button
        onClick={onClickButton}
        className="button button--lg bg-[#FEE500] text-black/85 typo-18-semibold"
      >
        <div className="flex gap-16 w-fit">
          <KakaoIcon width={20} height={20} />
          <span>3초만에 카카오로 시작하기</span>
        </div>
      </button>
    </div>
  );
};

export default Login;
