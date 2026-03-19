import { ApiError } from "@/src/shared/lib/error/ApiError";
import { buildAuthUrl } from "@/src/shared/utils/buildAuthUrl";
import { TDateVoteByYMDResponse } from "../types";

/**
 * 특정 날짜의 투표 현황
 * @param appointmentId
 * @param ymd YYYY-MM-DD 형식의 문자열
 */
export async function getVoteStatusByYMD(
  appointmentId: string,
  ymd: string,
  init?: RequestInit,
) {
  const searchParams = new URLSearchParams({ ymd });
  const res = await fetch(
    buildAuthUrl(`/date/specify/${appointmentId}?${searchParams.toString()}`),
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
    const status = status_code ?? res.status;
    const msg = message ?? "Failed to get date voting status by date(ymd)";
    throw new ApiError("UNKNOWN", msg, status);
  }

  return resBody.data as TDateVoteByYMDResponse;
}
