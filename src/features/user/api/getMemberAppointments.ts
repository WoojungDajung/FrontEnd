import { ApiError } from "@/src/shared/lib/error/ApiError";
import { API_ERROR_CODE } from "@/src/shared/lib/error/errorCode";
import { TMemberAppointments } from "../types";
import { buildAuthUrl } from "@/src/shared/utils/buildAuthUrl";

export async function getMemberAppointments(
  init?: RequestInit,
): Promise<TMemberAppointments> {
  const res = await fetch(buildAuthUrl(`/member/appointments`), {
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
    // if (status_code === 401 || res.status === 401) {
    //   // 토큰 만료 또는 유효하지 않은 요청 데이터
    // }
    if (status_code === 404) {
      // 방 정보를 찾을 수 없거나 참여자가 아님
      throw new ApiError(API_ERROR_CODE.APPOINTMENT_NOT_EXISTED, message, 404);
    }
    const msg = message ?? "Failed to get the list of appointment";
    const status = status_code ?? res.status;
    throw new ApiError("UNKNOWN", msg, status);
  }

  return resBody.data as TMemberAppointments;
}
