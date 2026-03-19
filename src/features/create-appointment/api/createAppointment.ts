import { buildAuthUrl } from "@/src/shared/utils/buildAuthUrl";
import { ApiError } from "@/src/shared/lib/error/ApiError";
import { API_ERROR_CODE } from "@/src/shared/lib/error/errorCode";
import { TAppointmentResponse } from "@/src/entities/appointment/types";

/**
 * 약속방 생성
 * @param appointmentName
 * @param deadline YYYY-MM-DD 형식의 문자열
 * @returns
 */
export async function createAppointment(
  appointmentName: string,
  deadline: string,
  nickName: string,
  startingPlace: {
    address: string;
    startingPlace: string;
    latitude: string;
    longitude: string;
  } | null,
  init?: RequestInit,
): Promise<TAppointmentResponse> {
  const res = await fetch(buildAuthUrl("/appointment"), {
    ...init,
    method: "POST",
    body: JSON.stringify({
      appointmentName,
      appointmentDueDate: deadline,
      appointmentUserProfile: {
        nickName: nickName,
        address: startingPlace?.address ?? "",
        startingPlace: startingPlace?.startingPlace ?? "",
        latitude: startingPlace?.latitude ?? "",
        longitude: startingPlace?.longitude ?? "",
      },
    }),
    headers: {
      ...(init?.headers ?? {}),
      "Content-Type": "application/json",
    },
  });

  const resBody = await res.json();
  const { status_code, message, code } = resBody;

  if (!res.ok || status_code !== 200) {
    console.log(resBody);
    if (code) {
      throw new ApiError(code, message, res.status);
    }
    if (status_code === 400) {
      // 유저가 존재하지 않음
      throw new ApiError(API_ERROR_CODE.USER_NOT_EXISTED, message, 400);
    }
    const status = status_code ?? res.status;
    const msg = message ?? "Failed to create an appointment";
    throw new ApiError("UNKNOWN", msg, status);
  }
  return resBody.data as TAppointmentResponse;
}
