import { MemberProfile } from "@/types/apiResponse";

export async function getMemberProfile(
  appointmentId: string,
): Promise<MemberProfile | null> {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth-api/member/${appointmentId}`;
  const res = await fetch(url, {
    method: "GET",
  });

  const resBody = await res.json();
  console.log(resBody);

  // 해당 방에 유저 참여 정보가 없음
  if (res.status === 400) {
    return null;
  }

  if (!res.ok) {
    const { status_code, message } = resBody;
    throw new Error(`${status_code}: ${message}`);
  }

  return resBody.data as MemberProfile;
}
