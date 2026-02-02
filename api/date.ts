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

export async function voteDate(
  appointmentId: string,
  votes: {
    date: string; // YYYY-MM-DD 형식의 문자열
    type: "CERTAIN" | "UNCERTAIN";
  }[],
) {
  const dateList = votes.map((vote) => {
    const availability = vote.type === "CERTAIN" ? 1 : 2;
    return { ymd: vote.date, availability };
  });

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth-api/date/vote/${appointmentId}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dateList }),
  });

  const resBody = await res.json();
  console.log(resBody);
  const { status_code, message } = resBody;

  if (!res.ok || status_code !== 200) {
    throw new Error(`${status_code}: ${message}`);
  }

  return resBody.data;
}
