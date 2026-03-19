import { buildAuthUrl } from "@/src/shared/utils/buildAuthUrl";
import { MemberProfile } from "../../types";
import { ApiError } from "@/src/shared/lib/error/ApiError";
import { API_ERROR_CODE } from "@/src/shared/lib/error/errorCode";

export async function getMemberProfile(
  appointmentId: string,
  init?: RequestInit,
): Promise<MemberProfile> {
  const res = await fetch(buildAuthUrl(`/member/${appointmentId}`), {
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
    if (status_code === 400) {
      // 해당 방에 유저 참여 정보가 없음 (=아직 프로필 등록 안한 사용자)
      throw new ApiError(API_ERROR_CODE.NOT_JOINED_APPOINTMENT, message, 403);
    }
    // if (status_code === 401 || res.status === 401) {
    //   // 토큰 만료
    //   throw new Error(ERROR_MESSAGE.LOGIN_REQUIRED);
    // }
    if (status_code === 404) {
      // 방이 존재하지 않음
      throw new ApiError(API_ERROR_CODE.APPOINTMENT_NOT_EXISTED, message, 404);
    }
    const msg = message ?? "Failed to get the member profile";
    const status = status_code ?? res.status;
    throw new ApiError("UNKNOWN", msg, status);
  }

  return resBody.data as MemberProfile;
}
