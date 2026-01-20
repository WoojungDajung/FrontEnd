"use client";

import { getAuthorizationUrl } from "@/lib/auth/kakao";
import Button from "../shared/Button";
import KakaoIcon from "../shared/KakaoIcon";
import { useSearchParams } from "next/navigation";

const Login = () => {
  const searchParams = useSearchParams()
  const next = searchParams.get("next")

  const handleLogin = () => {
    window.location.href = getAuthorizationUrl(next ?? undefined);
  };

  return (
    <div>
      <Button
        size="Large"
        className="bg-[#FEE500] text-[rgba(0,0,0,0.85)]"
        onClick={handleLogin}
      >
        <div className="flex gap-16 w-fit">
          <KakaoIcon width={20} height={20} />
          <span>3초만에 카카오로 시작하기</span>
        </div>
      </Button>
    </div>
  );
};

export default Login;
