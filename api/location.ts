import { TLocationListResponse, TLocationResponse } from "@/types/apiResponse";

/* 장소 목록 조회 */
export async function getLocations(appointmentId: string) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth-api/location/${appointmentId}`;
  const res = await fetch(url, {
    method: "GET",
  });

  const resBody = await res.json();
  console.log(resBody);

  if (!res.ok) {
    if (res.status === 400) {
      // 유저가 존재하지 않습니다.
    }
    if (res.status === 404) {
      // 방 참여자가 아닙니다.
    }

    const { status_code, message } = resBody;
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
) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth-api/location/${appointmentId}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
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

  if (!res.ok) {
    const { status_code, message } = resBody;
    throw new Error(`${status_code}: ${message}`);
  }

  return;
}

/* 특정 장소 조회 */
export async function getLocation(appointmentId: string, placeId: number) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth-api/location/specify/${appointmentId}/${placeId}`;
  const res = await fetch(url, {
    method: "GET",
  });

  const resBody = await res.json();
  console.log(resBody);

  if (!res.ok) {
    if (res.status === 404) {
      // 방이 존재하지 않습니다.
    }
    const { status_code, message } = resBody;
    throw new Error(`${status_code}: ${message}`);
  }

  return resBody.data as TLocationResponse;
}

/* 장소 삭제 */
export async function deleteLocation(appointmentId: string, placeId: number) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth-api/location/${appointmentId}/${placeId}`;
  const res = await fetch(url, {
    method: "DELETE",
  });

  const resBody = await res.json();
  console.log(resBody);

  if (!res.ok) {
    if (res.status === 404) {
      // 방이 존재하지 않습니다.
    }
    const { status_code, message } = resBody;
    throw new Error(`${status_code}: ${message}`);
  }

  return;
}
