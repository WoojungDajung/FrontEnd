import { ApiError } from "@/src/shared/lib/error/ApiError";
import { API_ERROR_CODE } from "@/src/shared/lib/error/errorCode";
import { buildAuthUrl } from "@/src/shared/utils/buildAuthUrl";
import { TLocationResponse } from "../types";

export async function getLocation(
  appointmentId: string,
  placeId: number,
  init?: RequestInit,
) {
  const res = await fetch(
    buildAuthUrl(`/location/specify/${appointmentId}/${placeId}`),
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
      // 방이 존재하지 않습니다.
      throw new ApiError(API_ERROR_CODE.APPOINTMENT_NOT_EXISTED, message, 404);
    }
    const status = status_code ?? res.status;
    const msg = message ?? "Failed to get the location";
    throw new ApiError("UNKNOWN", msg, status);
  }

  return resBody.data as TLocationResponse;
}
