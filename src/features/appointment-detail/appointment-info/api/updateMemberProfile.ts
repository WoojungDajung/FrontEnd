import { ApiError } from "@/src/shared/lib/error/ApiError";
import { API_ERROR_CODE } from "@/src/shared/lib/error/errorCode";
import { buildAuthUrl } from "@/src/shared/utils/buildAuthUrl";
import { TRegisterMemberProfileResponse } from "../types";

/**
 * 멤버 정보 등록 및 수정
 * @param {string} place - 출발 장소. undefined이면 nickName만 수정. null이면 출발 장소 없음.
 */
export async function updateMemberProfile(
  appointmentId: string,
  nickName: string,
  place?: {
    address: string;
    startingPlace: string;
    latitude: string;
    longitude: string;
  } | null,
  init?: RequestInit,
): Promise<TRegisterMemberProfileResponse> {
  const body =
    place === undefined
      ? { nickName }
      : {
          nickName,
          address: place?.address ?? "",
          startingPlace: place?.startingPlace ?? "",
          latitude: place?.latitude ?? "",
          longitude: place?.longitude ?? "",
        };

  const res = await fetch(buildAuthUrl(`/member/${appointmentId}`), {
    ...init,
    method: "PUT",
    headers: {
      ...(init?.headers ?? {}),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const resBody = await res.json();
  const { status_code, message, code } = resBody;

  if (!res.ok || status_code !== 200) {
    console.log(resBody);

    if (code) {
      throw new ApiError(code, message, res.status);
    }
    // if (res.status === 401 || status_code === 401) {
    //   // 토큰 만료 또는 유효하지 않은 요청 데이터
    // }
    if (status_code === 404) {
      //방 정보를 찾을 수 없거나 참여자가 아님
      throw new ApiError(API_ERROR_CODE.APPOINTMENT_NOT_EXISTED, message, 404);
    }
    const status = status_code ?? res.status;
    const msg = message ?? "Failed to update the member profile";
    throw new ApiError("UNKNOWN", msg, status);
  }

  return resBody.data as TRegisterMemberProfileResponse;
}
