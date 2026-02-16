import { ERROR_MESSAGE } from "@/constants/error-message";
import {
  MemberProfile,
  TMemberAppointments,
  TRegisterMemberProfileResponse,
} from "@/types/apiResponse";

export async function getMemberProfile(
  appointmentId: string,
): Promise<MemberProfile> {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth-api/member/${appointmentId}`;
  const res = await fetch(url, {
    method: "GET",
  });

  const resBody = await res.json();
  console.log(resBody);
  const { status_code, message } = resBody;

  if (!res.ok || status_code !== 200) {
    if (status_code === 400) {
      // 해당 방에 유저 참여 정보가 없음 (=아직 프로필 등록 안한 사용자)
      throw new Error(ERROR_MESSAGE.NOT_JOINED_APPOINTMENT);
    }
    if (status_code === 401 || res.status === 401) {
      // 토큰 만료
      throw new Error(ERROR_MESSAGE.LOGIN_REQUIRED);
    }
    if (status_code === 404) {
      // 방이 존재하지 않음
      throw new Error(ERROR_MESSAGE.APPOINTMENT_NOT_EXIST);
    }
    throw new Error(`${status_code}: ${message}`);
  }

  return resBody.data as MemberProfile;
}

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

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/auth-api/member/${appointmentId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const resBody = await res.json();
  console.log(resBody);
  const { status_code, message } = resBody;

  if (!res.ok || status_code !== 200) {
    if (res.status === 401 || status_code === 401) {
      // 토큰 만료 또는 유효하지 않은 요청 데이터
    }
    if (status_code === 404) {
      //방 정보를 찾을 수 없거나 참여자가 아님
    }
    throw new Error(`${status_code}: ${message}`);
  }

  return resBody.data as TRegisterMemberProfileResponse;
}

export async function getMemberAppointments(): Promise<TMemberAppointments> {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth-api/member/appointments`;
  const res = await fetch(url, {
    method: "GET",
  });

  const resBody = await res.json();
  console.log(resBody);
  const { status_code, message } = resBody;

  if (!res.ok || status_code !== 200) {
    if (status_code === 401 || res.status === 401) {
      // 토큰 만료 또는 유효하지 않은 요청 데이터
    }
    if (status_code === 404) {
      // 방 정보를 찾을 수 없거나 참여자가 아님
    }
    throw new Error(`${status_code}: ${message}`);
  }

  return resBody.data as TMemberAppointments;
}
