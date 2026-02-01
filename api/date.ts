import { TDateVoteResponse } from "@/types/apiResponse";

export async function getVoteStatus(appointmentId: string) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth-api/date/vote/${appointmentId}`;
  const res = await fetch(url, {
    method: "GET",
  });

  const resBody = await res.json();
  console.log(resBody);

  if (!res.ok) {
    const { status_code, message } = resBody;
    throw new Error(`${status_code}: ${message}`);
  }

  return resBody.data as TDateVoteResponse;
}
