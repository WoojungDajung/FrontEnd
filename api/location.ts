import {
  TLocationListResponse,
  TLocationResponse,
  TMyVoteLocationResponse,
  TVoteStatusResponse,
} from "@/types/apiResponse";
import { buildAuthUrl } from "./utils";

/* 장소 목록 조회 */
export async function getLocations(appointmentId: string, init?: RequestInit) {
  const res = await fetch(buildAuthUrl(`/location/${appointmentId}`), {
    ...init,
    method: "GET",
  });

  const resBody = await res.json();
  console.log(resBody);
  const { status_code, message } = resBody;

  if (!res.ok || status_code !== 200) {
    if (status_code === 400) {
      // 유저가 존재하지 않습니다.
    }
    if (status_code === 404) {
      // 방 참여자가 아닙니다.
    }

    throw new Error(`${status_code}: ${message}`);
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
  console.log(resBody);
  const { status_code, message } = resBody;

  if (!res.ok || status_code !== 200) {
    if (status_code === 402) {
      // 프로필 미설정(닉네임/출발지)
    }
    if (status_code === 409) {
      // 장소 중복
    }
    throw new Error(`${status_code}: ${message}`);
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
  console.log(resBody);
  const { status_code, message } = resBody;

  if (!res.ok || status_code !== 200) {
    if (status_code === 404) {
      // 방이 존재하지 않습니다.
    }
    throw new Error(`${status_code}: ${message}`);
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
  console.log(resBody);
  const { status_code, message } = resBody;

  if (!res.ok || status_code !== 200) {
    if (status_code === 402) {
      // 프로필 미설정(닉네임/출발지)
    }
    if (status_code === 404) {
      // 방 참여자가 아닙니다.
    }
    throw new Error(`${status_code}: ${message}`);
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
  console.log(resBody);
  const { status_code, message } = resBody;

  if (!res.ok || status_code !== 200) {
    if (status_code === 402) {
      // 프로필 미설정(닉네임/출발지)
    }
    if (status_code === 404) {
      // 방 참여자가 아닙니다.
    }
    throw new Error(`${status_code}: ${message}`);
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
  console.log(resBody);
  const { status_code, message } = resBody;

  if (!res.ok || status_code !== 200) {
    if (status_code === 402) {
      // 프로필 미설정(닉네임/출발지)
    }
    if (status_code === 404) {
      // 방 참여자가 아닙니다.
    }
    throw new Error(`${status_code}: ${message}`);
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
  const { status_code, message } = resBody;
  if (!res.ok || status_code !== 200) {
    if (status_code === 400) {
      // 해당 유저가 존재하지 않습니다.
    }
    if (status_code === 404) {
      // 방 참여자가 아닙니다.
    }
    throw new Error(`${status_code}: ${message}`);
  }

  return resBody.data as TVoteStatusResponse;
}
