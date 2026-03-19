"use client";

import { useRouter } from "next/navigation";
import { getAuthorizationUrl } from "@/src/features/auth/lib/kakao";
import KakaoIcon from "@/src/shared/ui/icons/KakaoIcon";

interface LoginProps {
  next?: string; // 로그인 후 돌아갈 경로
}

const Login = ({ next }: LoginProps) => {
  const router = useRouter();

  const onClickButton = () => {
    sessionStorage.removeItem("login-tracked");
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
