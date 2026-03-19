import { TAppointmentResponse } from "@/src/entities/appointment/types";
import { ApiError } from "@/src/shared/lib/error/ApiError";
import { API_ERROR_CODE } from "@/src/shared/lib/error/errorCode";
import { buildAuthUrl } from "@/src/shared/utils/buildAuthUrl";

/**
 * 현재 로그인된 유저의 정보를 포함한 전체적인 약속 정보를 가져오는 함수
 * @param appointmentId
 * @param init
 * @returns
 */
export async function getAppointment(
  appointmentId: string,
  init?: RequestInit,
) {
  const res = await fetch(buildAuthUrl(`/appointment/${appointmentId}`), {
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
    if (status_code === 404) {
      //해당 방이 존재하지 않음
      throw new ApiError(API_ERROR_CODE.APPOINTMENT_NOT_EXISTED, message, 404);
    }
    const status = status_code ?? res.status;
    const msg = message ?? "Failed to get the appointment";
    throw new ApiError("UNKNOWN", msg, status);
  }
  return resBody.data as TAppointmentResponse;
}
