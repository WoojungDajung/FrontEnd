import { ApiError } from "@/src/shared/lib/error/ApiError";
import { API_ERROR_CODE } from "@/src/shared/lib/error/errorCode";
import { buildAuthUrl } from "@/src/shared/utils/buildAuthUrl";

export async function leaveAppointment(
  appointmentId: string,
  init?: RequestInit,
) {
  const res = await fetch(
    buildAuthUrl(`/appointment/participant/${appointmentId}`),
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
    if (status_code === 401) {
      // 호스트는 나갈 수 없음
      throw new ApiError(API_ERROR_CODE.HOST_NOT_ALLOWED, message, 403);
    }
    if (status_code === 404) {
      // 참여 중인 유저가 아니거나 방이 없음
      throw new ApiError(API_ERROR_CODE.APPOINTMENT_NOT_EXISTED, message, 404);
    }
    const status = status_code ?? res.status;
    const msg = message ?? "Failed to leave the appointment";
    throw new ApiError("UNKNOWN", msg, status);
  }

  return;
}
