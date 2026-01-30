"use client";

import Button from "@/components/shared/Button";
import { ERROR_CODE } from "@/constants/error-code";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const RetryButton = () => {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("code");

  const router = useRouter();

  const onClickButton = useCallback(() => {
    if (
      errorCode === ERROR_CODE.AUTH_TOKEN_EXCHANGED_FAILED ||
      errorCode === ERROR_CODE.AUTH_UNKNOWN_ERROR
    ) {
      router.push("/");
    }

    router.push("/");
  }, [errorCode, router]);

  return (
    <Button size="Medium" color="Primary" onClick={onClickButton}>
      다시 시도하기
    </Button>
  );
};

export default RetryButton;
