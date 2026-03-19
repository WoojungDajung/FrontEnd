import { ApiError } from "@/src/shared/lib/error/ApiError";
import { buildAuthUrl } from "@/src/shared/utils/buildAuthUrl";

export async function voteDate(
  appointmentId: string,
  votes: {
    date: string; // YYYY-MM-DD 형식의 문자열
    type: "POSSIBLE" | "IMPOSSIBLE" | "UNCERTAIN";
  }[],
  init?: RequestInit,
) {
  const availability = {
    IMPOSSIBLE: 0,
    POSSIBLE: 1,
    UNCERTAIN: 2,
  };

  const dateList = votes.map((vote) => {
    return { ymd: vote.date, availability: availability[vote.type] };
  });

  const res = await fetch(buildAuthUrl(`/date/vote/${appointmentId}`), {
    ...init,
    method: "POST",
    headers: {
      ...(init?.headers ?? {}),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dateList }),
  });

  const resBody = await res.json();
  const { status_code, message, code } = resBody;

  if (!res.ok || status_code !== 200) {
    console.log(resBody);
    if (code) {
      throw new ApiError(code, message, res.status);
    }
    const status = status_code ?? res.status;
    const msg = message ?? "Failed to submit date vote";
    throw new ApiError("UNKNOWN", msg, status);
  }

  return resBody.data;
}
