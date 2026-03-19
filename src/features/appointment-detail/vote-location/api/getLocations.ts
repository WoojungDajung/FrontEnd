import { ApiError } from "@/src/shared/lib/error/ApiError";
import { API_ERROR_CODE } from "@/src/shared/lib/error/errorCode";
import { buildAuthUrl } from "@/src/shared/utils/buildAuthUrl";
import { TLocationListResponse } from "../types";

export async function getLocations(appointmentId: string, init?: RequestInit) {
  const res = await fetch(buildAuthUrl(`/location/${appointmentId}`), {
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
      // 유저가 존재하지 않습니다.
      throw new ApiError(API_ERROR_CODE.USER_NOT_EXISTED, message, 400);
    }
    if (status_code === 404) {
      // 방 참여자가 아닙니다.
      throw new ApiError(API_ERROR_CODE.NOT_JOINED_APPOINTMENT, message, 403);
    }
    const status = status_code ?? res.status;
    const msg = message ?? "Failed to get the list of location";
    throw new ApiError("UNKNOWN", msg, status);
  }

  return resBody.data as TLocationListResponse;
}
