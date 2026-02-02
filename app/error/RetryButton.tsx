"use client";

import Button from "@/components/shared/Button";
import { ERROR_CODE } from "@/constants/error-code";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const RetryButton = () => {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("code");
  const next = searchParams.get("next");

  const router = useRouter();

  const onClickButton = useCallback(() => {
    if (
      errorCode === ERROR_CODE.AUTH_TOKEN_EXCHANGED_FAILED ||
      errorCode === ERROR_CODE.AUTH_UNKNOWN_ERROR
    ) {
      if (next) {
        router.push(`/?next=${next}`);
      } else {
        router.push(`/`);
      }
    } else {
      // 그외의 에러는 next가 있으면 버튼 눌렀을 때 해당 주소로 이동하도록
      if (next) {
        router.push(next);
      } else {
        router.push("/");
      }
    }
  }, [errorCode, next, router]);

  return (
    <Button size="Medium" color="Primary" onClick={onClickButton}>
      다시 시도하기
    </Button>
  );
};

export default RetryButton;
