import { ApiError } from "@/src/shared/lib/error/ApiError";
import { buildAuthUrl } from "@/src/shared/utils/buildAuthUrl";
import { TVoteStatusResponse } from "../../types";

export async function getDateVoteStatus(
  appointmentId: string,
  init?: RequestInit,
) {
  const res = await fetch(buildAuthUrl(`/date/vote/${appointmentId}`), {
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
    const status = status_code ?? res.status;
    const msg = message ?? "Failed to get the date voting status";
    throw new ApiError("UNKNOWN", msg, status);
  }

  return resBody.data as TVoteStatusResponse;
}
