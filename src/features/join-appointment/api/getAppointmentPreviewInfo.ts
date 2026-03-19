import { buildAuthUrl } from "@/src/shared/utils/buildAuthUrl";
import { ApiError } from "@/src/shared/lib/error/ApiError";
import { API_ERROR_CODE } from "@/src/shared/lib/error/errorCode";
import { TAppointmentPreviewResponse } from "../types";

/**
 * 참여여부와 관계없이, 간소화된 약속 정보를 가져오는 함수
 * /appointment/[appointmentId]/join 페이지에서 사용됨
 * @param appointmentId
 * @param init
 * @returns
 */
export async function getAppointmentPreviewInfo(
  appointmentId: string,
  init?: RequestInit,
): Promise<TAppointmentPreviewResponse> {
  const res = await fetch(buildAuthUrl(`/appointment/info/${appointmentId}`), {
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
    const msg = message ?? "Failed to get the preview of the appointment";
    throw new ApiError("UNKNOWN", msg, status);
  }
  return resBody.data as TAppointmentPreviewResponse;
}
