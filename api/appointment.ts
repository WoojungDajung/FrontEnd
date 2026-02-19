import { ERROR_MESSAGE } from "@/constants/error-message";
import {
  TAppointmentPreviewResponse,
  TAppointmentResponse,
} from "@/types/apiResponse";
import dayjs from "dayjs";

/**
 * 약속방 생성
 * @param appointmentName
 * @param deadline YYYY-MM-DD 형식의 문자열
 * @returns
 */
export async function createAppointment(
  appointmentName: string,
  deadline: string,
  nickName: string,
  startingPlace: {
    address: string;
    startingPlace: string;
    latitude: string;
    longitude: string;
  } | null,
): Promise<TAppointmentResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/auth-api/appointment`,
    {
      method: "POST",
      body: JSON.stringify({
        appointmentName,
        appointmentDueDate: deadline,
        appointmentUserProfile: {
          nickName: nickName,
          address: startingPlace?.address ?? "",
          startingPlace: startingPlace?.startingPlace ?? "",
          latitude: startingPlace?.latitude ?? "",
          longitude: startingPlace?.longitude ?? "",
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const resBody = await res.json();
  console.log(resBody);
  const { status_code, message } = resBody;

  if (!res.ok || status_code !== 200) {
    if (status_code === 400) {
      // 유저가 존재하지 않음
    }
    throw new Error(`${status_code}: ${message}`);
  }
  return resBody.data as TAppointmentResponse;
}

/**
 * 현재 로그인된 유저의 정보를 포함한 전체적인 약속 정보를 가져오는 함수
 * @param appointmentId
 * @param init
 * @returns
 */
export async function getAppointment(
  appointmentId: string,
  init?: RequestInit,
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/auth-api/appointment/${appointmentId}`,
    { method: "GET", ...init },
  );

  const resBody = await res.json();
  console.log(resBody);
  const { status_code, message } = resBody;

  if (!res.ok || status_code !== 200) {
    if (status_code === 404) {
      //해당 방이 존재하지 않음
      throw new Error(ERROR_MESSAGE.APPOINTMENT_NOT_EXIST);
    }
    throw new Error(`${status_code}: ${message}`);
  }
  return resBody.data as TAppointmentResponse;
}

export async function editAppointment(
  appointmentId: string,
  appointmentName: string,
  appointmentDueDate: Date,
) {
  const dueDateStr = dayjs(appointmentDueDate).format("YYYY-MM-DD");

  const res = await fetch(`/auth-api/appointment/${appointmentId}`, {
    method: "PUT",
    body: JSON.stringify({
      appointmentName,
      appointmentDueDate: dueDateStr,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const resBody = await res.json();
  const { status_code, message } = resBody;

  if (!res.ok || status_code !== 200) {
    if (status_code === 404) {
      // 방이 존재하지 않거나 참여자가 아님
    }
    throw new Error(`${status_code}: ${message}`);
  }

  return resBody.data as TAppointmentResponse;
}

/* 약속 방 참여 */
export async function joinAppointment(
  appointmentId: string,
  nickName: string,
  startingPlace: {
    address: string;
    startingPlace: string;
    latitude: string;
    longitude: string;
  } | null,
): Promise<TAppointmentResponse> {
  const res = await fetch(`/auth-api/appointment/join/${appointmentId}`, {
    method: "POST",
    body: JSON.stringify({
      nickName: nickName,
      address: startingPlace?.address ?? "",
      startingPlace: startingPlace?.startingPlace ?? "",
      latitude: startingPlace?.latitude ?? "",
      longitude: startingPlace?.longitude ?? "",
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const resBody = await res.json();
  console.log(resBody);
  const { status_code, message } = resBody;

  if (!res.ok || status_code !== 200) {
    if (status_code === 404) {
      // 해당 방이 존재하지 않음
    }
    throw new Error(`${status_code}: ${message}`);
  }

  return resBody.data as TAppointmentResponse;
}

/* 약속 나가기 */
export async function leaveAppointment(appointmentId: string) {
  const res = await fetch(
    `/auth-api/appointment/participant/${appointmentId}`,
    {
      method: "DELETE",
    },
  );

  const resBody = await res.json();
  console.log(resBody);
  const { status_code, message } = resBody;

  if (!res.ok || status_code !== 200) {
    if (status_code === 401) {
      // 호스트는 나갈 수 없음
    }
    if (status_code === 404) {
      // 참여 중인 유저가 아니거나 방이 없음
    }
    throw new Error(`${status_code}: ${message}`);
  }

  return;
}

/**
 * 약속 방 삭제
 * @param appointmentId
 */
export async function deleteAppointment(appointmentId: string) {
  const res = await fetch(`/auth-api/appointment/${appointmentId}`, {
    method: "DELETE",
  });

  const resBody = await res.json();
  console.log(resBody);
  const { status_code, message } = resBody;

  if (!res.ok || status_code !== 200) {
    if (status_code === 401) {
      // 삭제 권한 없음 (호스트가 아님)
    }
    if (status_code === 404) {
      // 방이 존재하지 않음
    }
    throw new Error(`${status_code}: ${message}`);
  }

  return;
}

/**
 * 참여여부와 관계없이, 간소화된 약속 정보를 가져오는 함수
 * /appointment/[appointmentId]/join 페이지에서 사용됨
 * @param appointmentId
 * @param init
 * @returns
 */
export async function getAppointmentPreviewInfo(
  appointmentId: string,
  init?: RequestInit,
): Promise<TAppointmentPreviewResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/auth-api/appointment/info/${appointmentId}`,
    { method: "GET", ...init },
  );

  const resBody = await res.json();
  console.log(resBody);
  const { status_code, message } = resBody;

  if (!res.ok || status_code !== 200) {
    if (status_code === 404) {
      //해당 방이 존재하지 않음
      throw new Error(ERROR_MESSAGE.APPOINTMENT_NOT_EXIST);
    }
    throw new Error(`${status_code}: ${message}`);
  }
  return resBody.data as TAppointmentPreviewResponse;
}
