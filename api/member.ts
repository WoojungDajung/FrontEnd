import {
  MemberProfile,
  TRegisterMemberProfileResponse,
} from "@/types/apiResponse";

export async function getMemberProfile(
  appointmentId: string,
): Promise<MemberProfile | null> {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth-api/member/${appointmentId}`;
  const res = await fetch(url, {
    method: "GET",
  });

  const resBody = await res.json();
  console.log(resBody);

  // 해당 방에 유저 참여 정보가 없음 (=아직 프로필 등록 안한 사용자)
  if (res.status === 400) {
    return null;
  }

  if (!res.ok) {
    const { status_code, message } = resBody;
    throw new Error(`${status_code}: ${message}`);
  }

  return resBody.data as MemberProfile;
}

/* 멤버 정보 등록 및 수정 */
export async function registerMemberProfile(
  appointmentId: string,
  nickName: string,
  place?: {
    address: string;
    startingPlace: string;
    latitude: string;
    longitude: string;
  },
): Promise<TRegisterMemberProfileResponse> {
  const body:TRegisterMemberProfileResponse ={
    nickName,
    address: place?.address ?? "",
    startingPlace: place?.startingPlace ?? "",
    latitude: place?.latitude ?? "",
    longitude: place?.longitude ?? ""
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/auth-api/member/${appointmentId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const resBody = await res.json();
  console.log(resBody);

  if (!res.ok) {
    if (res.status === 401) {
      // 토큰 만료 또는 유효하지 않은 요청 데이터
    }
    if (res.status === 404) {
      //방 정보를 찾을 수 없거나 참여자가 아님
    }
    const { status_code, message } = resBody;
    throw new Error(`${status_code}: ${message}`);
  }

  return resBody.data as TRegisterMemberProfileResponse;
}
