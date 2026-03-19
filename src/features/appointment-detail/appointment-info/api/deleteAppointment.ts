import { ApiError } from "@/src/shared/lib/error/ApiError";
import { API_ERROR_CODE } from "@/src/shared/lib/error/errorCode";
import { buildAuthUrl } from "@/src/shared/utils/buildAuthUrl";

/**
 * 약속 방 삭제
 * @param appointmentId
 */
export async function deleteAppointment(
  appointmentId: string,
  init?: RequestInit,
) {
  const res = await fetch(buildAuthUrl(`/appointment/${appointmentId}`), {
    ...init,
    method: "DELETE",
  });

  const resBody = await res.json();
  const { status_code, message, code } = resBody;

  if (!res.ok || status_code !== 200) {
    console.log(resBody);
    if (code) {
      throw new ApiError(code, message, res.status);
    }
    if (status_code === 401) {
      // 삭제 권한 없음 (호스트가 아님)
      throw new ApiError(API_ERROR_CODE.PERMISSION_DENIED, message, 403);
    }
    if (status_code === 404) {
      // 방이 존재하지 않음
      throw new ApiError(API_ERROR_CODE.APPOINTMENT_NOT_EXISTED, message, 404);
    }
    const status = status_code ?? res.status;
    const msg = message ?? "Failed to delete the appointment";
    throw new ApiError("UNKNOWN", msg, status);
  }

  return;
}
