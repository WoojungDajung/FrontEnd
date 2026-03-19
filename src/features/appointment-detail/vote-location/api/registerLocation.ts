import { ApiError } from "@/src/shared/lib/error/ApiError";
import { API_ERROR_CODE } from "@/src/shared/lib/error/errorCode";
import { buildAuthUrl } from "@/src/shared/utils/buildAuthUrl";

export async function registerLocation(
  appointmentId: string,
  placeName: string,
  address: string,
  latitude: string,
  longitude: string,
  init?: RequestInit,
) {
  const res = await fetch(buildAuthUrl(`/location/${appointmentId}`), {
    ...init,
    method: "POST",
    headers: {
      ...(init?.headers ?? {}),
      "content-type": "application/json",
    },
    body: JSON.stringify({
      name: placeName,
      address,
      latitude,
      longitude,
    }),
  });

  const resBody = await res.json();
  const { status_code, message, code } = resBody;

  if (!res.ok || status_code !== 200) {
    console.log(resBody);
    if (code) {
      throw new ApiError(code, message, res.status);
    }
    if (status_code === 402) {
      // 프로필 미설정(닉네임/출발지)
      throw new ApiError(API_ERROR_CODE.NOT_JOINED_APPOINTMENT, message, 403);
    }
    if (status_code === 409) {
      // 장소 중복
      throw new ApiError(API_ERROR_CODE.ALREADY_EXISTS, message, 409);
    }
    const msg = message ?? "Failed to register the location";
    const status = status_code ?? res.status;
    throw new ApiError("UNKNOWN", msg, status);
  }

  return;
}
