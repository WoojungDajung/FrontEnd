import { TDateVoteResponse } from "@/types/apiResponse";

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
