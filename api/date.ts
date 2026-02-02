import {
  TDateVoteByMonthResponse,
  TDateVoteResponse,
} from "@/types/apiResponse";

export async function getVoteStatus(appointmentId: string) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth-api/date/vote/${appointmentId}`;
  const res = await fetch(url, {
    method: "GET",
  });

  const resBody = await res.json();
  console.log(resBody);
  const { status_code, message } = resBody;

  if (!res.ok || status_code !== 200) {
    throw new Error(`${status_code}: ${message}`);
  }

  return resBody.data as TDateVoteResponse;
}

export async function getVoteStatusByMonth(appointmentId: string, ym: string) {
  const searchParams = new URLSearchParams({ ym });
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth-api/date/${appointmentId}?${searchParams.toString()}`;
  const res = await fetch(url, {
    method: "GET",
  });

  const resBody = await res.json();
  console.log(resBody);
  const { status_code, message } = resBody;

  if (!res.ok || status_code !== 200) {
    if (status_code === 404) {
      // 방 또는 참여정보를 찾을 수 없음
    }
    throw new Error(`${status_code}: ${message}`);
  }

  return resBody.data as TDateVoteByMonthResponse;
}
