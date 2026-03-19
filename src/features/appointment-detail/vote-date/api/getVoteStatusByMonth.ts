import { ApiError } from "@/src/shared/lib/error/ApiError";
import { API_ERROR_CODE } from "@/src/shared/lib/error/errorCode";
import { buildAuthUrl } from "@/src/shared/utils/buildAuthUrl";
import { TDateVoteByMonthResponse } from "../types";

export async function getVoteStatusByMonth(
  appointmentId: string,
  ym: string,
  init?: RequestInit,
) {
  const searchParams = new URLSearchParams({ ym });
  const res = await fetch(
    buildAuthUrl(`/date/${appointmentId}?${searchParams.toString()}`),
    {
      ...init,
      method: "GET",
    },
  );

  const resBody = await res.json();
  const { status_code, message, code } = resBody;

  if (!res.ok || status_code !== 200) {
    console.log(resBody);
    if (code) {
      throw new ApiError(code, message, res.status);
    }
    if (status_code === 404) {
      // 방 또는 참여정보를 찾을 수 없음
      throw new ApiError(API_ERROR_CODE.APPOINTMENT_NOT_EXISTED, message, 404);
    }
    const status = status_code ?? res.status;
    const msg = message ?? "Failed to get the date voting status by month";
    throw new ApiError("UNKNOWN", msg, status);
  }

  return resBody.data as TDateVoteByMonthResponse;
}
