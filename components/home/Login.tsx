"use client";

import Button from "../shared/Button";
import KakaoIcon from "./KakaoIcon";

const Login = () => {
  return (
    <div>
      <Button size="Large" className="bg-[#FEE500] text-[rgba(0,0,0,0.85)]">
        <div className="flex gap-16 w-fit">
          <KakaoIcon />
          <span>3초만에 카카오로 시작하기</span>
        </div>
      </Button>
    </div>
  );
};

export default Login;
