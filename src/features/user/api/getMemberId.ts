import { buildAuthUrl } from "@/src/shared/utils/buildAuthUrl";
import { TMemberIdResponse } from "../types";
import { ApiError } from "@/src/shared/lib/error/ApiError";
import { API_ERROR_CODE } from "@/src/shared/lib/error/errorCode";

export async function getMemberId(
  init?: RequestInit,
): Promise<TMemberIdResponse> {
  const res = await fetch(buildAuthUrl(`/member/memberId`), {
    ...init,
    method: "GET",
  });

  const resBody = await res.json();
  const { status_code, message, code } = resBody;

  if (!res.ok || status_code !== 200) {
    console.log(resBody);

    if (code) {
      throw new ApiError(code, message, res.status);
    }

    if (status_code === 400) {
      // 정확하지 않은 토큰 정보
      throw new ApiError(API_ERROR_CODE.AUTH_REQUIRED, message, 404);
    }
    const msg = message ?? "Failed to get the member id";
    const status = status_code ?? res.status;
    throw new ApiError("UNKNOWN", msg, status);
  }

  return resBody.data as TMemberIdResponse;
}
