import { TAppointmentResponse } from "@/src/entities/appointment/types";
import { ApiError } from "@/src/shared/lib/error/ApiError";
import { API_ERROR_CODE } from "@/src/shared/lib/error/errorCode";
import { buildAuthUrl } from "@/src/shared/utils/buildAuthUrl";

export async function editAppointment(
  appointmentId: string,
  appointmentName: string,
  appointmentDueDate: string, // YYYY-MM-DD 형식의 문자열
  init?: RequestInit,
) {
  const res = await fetch(buildAuthUrl(`/appointment/${appointmentId}`), {
    ...init,
    method: "PUT",
    body: JSON.stringify({
      appointmentName,
      appointmentDueDate,
    }),
    headers: {
      ...(init?.headers ?? {}),
      "Content-Type": "application/json",
    },
  });

  const resBody = await res.json();
  const { status_code, message, code } = resBody;

  if (!res.ok || status_code !== 200) {
    if (code) {
      throw new ApiError(code, message, res.status);
    }
    if (status_code === 404) {
      // 방이 존재하지 않거나 참여자가 아님
      throw new ApiError(API_ERROR_CODE.APPOINTMENT_NOT_EXISTED, message, 404);
    }
    const status = status_code ?? res.status;
    const msg = message ?? "Failed to edit the appointment";
    throw new ApiError("UNKNOWN", msg, status);
  }

  return resBody.data as TAppointmentResponse;
}
