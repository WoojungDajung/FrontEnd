import { ApiError } from "@/src/shared/lib/error/ApiError";
import { API_ERROR_CODE } from "@/src/shared/lib/error/errorCode";
import { buildAuthUrl } from "@/src/shared/utils/buildAuthUrl";

export async function deleteLocation(
  appointmentId: string,
  placeId: number,
  init?: RequestInit,
) {
  const res = await fetch(
    buildAuthUrl(`/location/${appointmentId}/${placeId}`),
    {
      ...init,
      method: "DELETE",
    },
  );

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
    if (status_code === 404) {
      // 방 참여자가 아닙니다.
      throw new ApiError(API_ERROR_CODE.NOT_JOINED_APPOINTMENT, message, 403);
    }
    const msg = message ?? "Failed to delete the location";
    const status = status_code ?? res.status;
    throw new ApiError("UNKNOWN", msg, status);
  }

  return;
}
