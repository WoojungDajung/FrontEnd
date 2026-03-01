import {
  TLocationListResponse,
  TLocationResponse,
  TMyVoteLocationResponse,
  TVoteStatusResponse,
} from "@/types/apiResponse";
import { buildAuthUrl } from "./utils";
import { ApiError } from "@/lib/error";
import { API_ERROR_CODE } from "@/constants/error-code";

/* 장소 목록 조회 */
export async function getLocations(appointmentId: string, init?: RequestInit) {
  const res = await fetch(buildAuthUrl(`/location/${appointmentId}`), {
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
    if (status_code === 400) {
      // 유저가 존재하지 않습니다.
      throw new ApiError(API_ERROR_CODE.USER_NOT_EXISTED, message, 400);
    }
    if (status_code === 404) {
      // 방 참여자가 아닙니다.
      throw new ApiError(API_ERROR_CODE.NOT_JOINED_APPOINTMENT, message, 403);
    }
    const status = status_code ?? res.status;
    const msg = message ?? "Failed to get the list of location";
    throw new ApiError("UNKNOWN", msg, status);
  }

  return resBody.data as TLocationListResponse;
}

/* 장소 등록 */
export async function registerLocation(
  appointmentId: string,
  placeName: string,
  address: string,
  latitude: string,
  longitude: string,
  init?: RequestInit,
) {
  const res = await fetch(buildAuthUrl(`/location/${appointmentId}`), {
    ...init,
    method: "POST",
    headers: {
      ...(init?.headers ?? {}),
      "content-type": "application/json",
    },
    body: JSON.stringify({
      name: placeName,
      address,
      latitude,
      longitude,
    }),
  });

  const resBody = await res.json();
  const { status_code, message, code } = resBody;

  if (!res.ok || status_code !== 200) {
    console.log(resBody);
    if (code) {
      throw new ApiError(code, message, res.status);
    }
    if (status_code === 402) {
      // 프로필 미설정(닉네임/출발지)
      throw new ApiError(API_ERROR_CODE.NOT_JOINED_APPOINTMENT, message, 403);
    }
    if (status_code === 409) {
      // 장소 중복
      throw new ApiError(API_ERROR_CODE.ALREADY_EXISTS, message, 409);
    }
    const msg = message ?? "Failed to register the location";
    const status = status_code ?? res.status;
    throw new ApiError("UNKNOWN", msg, status);
  }

  return;
}

/* 특정 장소 조회 */
export async function getLocation(
  appointmentId: string,
  placeId: number,
  init?: RequestInit,
) {
  const res = await fetch(
    buildAuthUrl(`/location/specify/${appointmentId}/${placeId}`),
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
      // 방이 존재하지 않습니다.
      throw new ApiError(API_ERROR_CODE.APPOINTMENT_NOT_EXISTED, message, 404);
    }
    const status = status_code ?? res.status;
    const msg = message ?? "Failed to get the location";
    throw new ApiError("UNKNOWN", msg, status);
  }

  return resBody.data as TLocationResponse;
}

/* 장소 삭제 */
export async function deleteLocation(
  appointmentId: string,
  placeId: number,
  init?: RequestInit,
) {
  const res = await fetch(
    buildAuthUrl(`/location/${appointmentId}/${placeId}`),
    {
      ...init,
      method: "DELETE",
    },
  );

  const resBody = await res.json();
  const { status_code, message, code } = resBody;

  if (!res.ok || status_code !== 200) {
    console.log(resBody);

    if (code) {
      throw new ApiError(code, message, res.status);
    }
    if (status_code === 402) {
      // 프로필 미설정(닉네임/출발지)
      throw new ApiError(API_ERROR_CODE.NOT_JOINED_APPOINTMENT, message, 403);
    }
    if (status_code === 404) {
      // 방 참여자가 아닙니다.
      throw new ApiError(API_ERROR_CODE.NOT_JOINED_APPOINTMENT, message, 403);
    }
    const msg = message ?? "Failed to delete the location";
    const status = status_code ?? res.status;
    throw new ApiError("UNKNOWN", msg, status);
  }

  return;
}

/* 내 장소 투표 현황 */
export async function getMyVoteLocation(
  appointmentId: string,
  init?: RequestInit,
) {
  const res = await fetch(buildAuthUrl(`/location/myvote/${appointmentId}`), {
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
    if (status_code === 402) {
      // 프로필 미설정(닉네임/출발지)
      throw new ApiError(API_ERROR_CODE.NOT_JOINED_APPOINTMENT, message, 403);
    }
    if (status_code === 404) {
      // 방 참여자가 아닙니다.
      throw new ApiError(API_ERROR_CODE.NOT_JOINED_APPOINTMENT, message, 403);
    }
    const msg = message ?? "Failed to get the user's place voting status";
    const status = status_code ?? res.status;
    throw new ApiError("UNKNOWN", msg, status);
  }

  return resBody.data as TMyVoteLocationResponse[];
}

/* 장소 투표 */
export async function voteLocation(
  appointmentId: string,
  placeIdList: number[],
  init?: RequestInit,
) {
  const res = await fetch(buildAuthUrl(`/location/vote/${appointmentId}`), {
    ...init,
    method: "POST",
    body: JSON.stringify({
      placeList: placeIdList,
    }),
    headers: {
      ...(init?.headers ?? {}),
      "Content-Type": "application/json",
    },
  });

  const resBody = await res.json();
  const { status_code, message, code } = resBody;

  if (!res.ok || status_code !== 200) {
    console.log(resBody);

    if (code) {
      throw new ApiError(code, message, res.status);
    }
    if (status_code === 402) {
      // 프로필 미설정(닉네임/출발지)
      throw new ApiError(API_ERROR_CODE.NOT_JOINED_APPOINTMENT, message, 403);
    }
    if (status_code === 404) {
      // 방 참여자가 아닙니다.
      throw new ApiError(API_ERROR_CODE.NOT_JOINED_APPOINTMENT, message, 403);
    }
    const msg = message ?? "Failed to submit location vote";
    const status = status_code ?? res.status;
    throw new ApiError("UNKNOWN", msg, status);
  }

  return;
}

export async function getLocationVoteStatus(
  appointmentId: string,
  init?: RequestInit,
) {
  const res = await fetch(buildAuthUrl(`/location/vote/${appointmentId}`), {
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
    if (status_code === 400) {
      // 해당 유저가 존재하지 않습니다.
      throw new ApiError(API_ERROR_CODE.USER_NOT_EXISTED, message, 400);
    }
    if (status_code === 404) {
      // 방 참여자가 아닙니다.
      throw new ApiError(API_ERROR_CODE.NOT_JOINED_APPOINTMENT, message, 403);
    }
    const msg = message ?? "Failed to get the vote status of the location";
    const status = status_code ?? res.status;
    throw new ApiError("UNKNOWN", msg, status);
  }

  return resBody.data as TVoteStatusResponse;
}
