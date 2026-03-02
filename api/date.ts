import {
  TDateVoteByMonthResponse,
  TDateVoteByUserResponse,
  TDateVoteByYMDResponse,
  TVoteStatusResponse,
} from "@/types/apiResponse";
import { buildAuthUrl } from "./utils";
import { ApiError } from "@/lib/error";
import { API_ERROR_CODE } from "@/constants/error-code";

export async function getVoteStatus(appointmentId: string, init?: RequestInit) {
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

export async function getVoteStatusByMonth(
  appointmentId: string,
  ym: string,
  init?: RequestInit,
) {
  const searchParams = new URLSearchParams({ ym });
  const res = await fetch(
    buildAuthUrl(`/date/${appointmentId}?${searchParams.toString()}`),
    {
      ...init,
      method: "GET",
    },
  );

  const resBody = await res.json();
  const { status_code, message, code } = resBody;

  if (!res.ok || status_code !== 200) {
    console.log(resBody);
    if (code) {
      throw new ApiError(code, message, res.status);
    }
    if (status_code === 404) {
      // 방 또는 참여정보를 찾을 수 없음
      throw new ApiError(API_ERROR_CODE.APPOINTMENT_NOT_EXISTED, message, 404);
    }
    const status = status_code ?? res.status;
    const msg = message ?? "Failed to get the date voting status by month";
    throw new ApiError("UNKNOWN", msg, status);
  }

  return resBody.data as TDateVoteByMonthResponse;
}

/**
 * 특정 날짜의 투표 현황
 * @param appointmentId
 * @param ymd YYYY-MM-DD 형식의 문자열
 */
export async function getVoteStatusByYMD(
  appointmentId: string,
  ymd: string,
  init?: RequestInit,
) {
  const searchParams = new URLSearchParams({ ymd });
  const res = await fetch(
    buildAuthUrl(`/date/specify/${appointmentId}?${searchParams.toString()}`),
    {
      ...init,
      method: "GET",
    },
  );

  const resBody = await res.json();
  const { status_code, message, code } = resBody;

  if (!res.ok || status_code !== 200) {
    console.log(resBody);
    if (code) {
      throw new ApiError(code, message, res.status);
    }
    const status = status_code ?? res.status;
    const msg = message ?? "Failed to get date voting status by date(ymd)";
    throw new ApiError("UNKNOWN", msg, status);
  }

  return resBody.data as TDateVoteByYMDResponse;
}

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

export async function getVoteStatusByUser(
  appointmentId: string,
  userId: number,
  init?: RequestInit,
) {
  const res = await fetch(buildAuthUrl(`/date/${appointmentId}/${userId}`), {
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
    if (status_code === 404) {
      // 방 또는 참여정보를 찾을 수 없음
      throw new ApiError(API_ERROR_CODE.APPOINTMENT_NOT_EXISTED, message, 404);
    }
    const status = status_code ?? res.status;
    const msg = message ?? "Failed to get the date voting status by user";
    throw new ApiError("UNKNOWN", msg, status);
  }

  return resBody.data as TDateVoteByUserResponse;
}
