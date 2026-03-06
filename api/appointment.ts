import {
  TAppointmentPreviewResponse,
  TAppointmentResponse,
} from "@/types/apiResponse";
import { buildAuthUrl } from "./utils";
import { ApiError } from "@/lib/error";
import { API_ERROR_CODE } from "@/constants/error-code";

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
  init?: RequestInit,
): Promise<TAppointmentResponse> {
  const res = await fetch(buildAuthUrl("/appointment"), {
    ...init,
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
    if (status_code === 400) {
      // 유저가 존재하지 않음
      throw new ApiError(API_ERROR_CODE.USER_NOT_EXISTED, message, 400);
    }
    const status = status_code ?? res.status;
    const msg = message ?? "Failed to create an appointment";
    throw new ApiError("UNKNOWN", msg, status);
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
  const res = await fetch(buildAuthUrl(`/appointment/${appointmentId}`), {
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
      //해당 방이 존재하지 않음
      throw new ApiError(API_ERROR_CODE.APPOINTMENT_NOT_EXISTED, message, 404);
    }
    const status = status_code ?? res.status;
    const msg = message ?? "Failed to get the appointment";
    throw new ApiError("UNKNOWN", msg, status);
  }
  return resBody.data as TAppointmentResponse;
}

export async function editAppointment(
  appointmentId: string,
  appointmentName: string,
  appointmentDueDate: string, // YYYY-MM-DD 형식의 문자열
  init?: RequestInit,
) {
  const res = await fetch(buildAuthUrl(`/appointment/${appointmentId}`), {
    ...init,
    method: "PUT",
    body: JSON.stringify({
      appointmentName,
      appointmentDueDate,
    }),
    headers: {
      ...(init?.headers ?? {}),
      "Content-Type": "application/json",
    },
  });

  const resBody = await res.json();
  const { status_code, message, code } = resBody;

  if (!res.ok || status_code !== 200) {
    if (code) {
      throw new ApiError(code, message, res.status);
    }
    if (status_code === 404) {
      // 방이 존재하지 않거나 참여자가 아님
      throw new ApiError(API_ERROR_CODE.APPOINTMENT_NOT_EXISTED, message, 404);
    }
    const status = status_code ?? res.status;
    const msg = message ?? "Failed to edit the appointment";
    throw new ApiError("UNKNOWN", msg, status);
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
  init?: RequestInit,
): Promise<TAppointmentResponse> {
  const res = await fetch(buildAuthUrl(`/appointment/join/${appointmentId}`), {
    ...init,
    method: "POST",
    body: JSON.stringify({
      nickName: nickName,
      address: startingPlace?.address ?? "",
      startingPlace: startingPlace?.startingPlace ?? "",
      latitude: startingPlace?.latitude ?? "",
      longitude: startingPlace?.longitude ?? "",
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
    if (status_code === 404) {
      // 해당 방이 존재하지 않음
      throw new ApiError(API_ERROR_CODE.APPOINTMENT_NOT_EXISTED, message, 404);
    }
    const status = status_code ?? res.status;
    const msg = message ?? "Failed to join the appointment";
    throw new ApiError("UNKNOWN", msg, status);
  }

  return resBody.data as TAppointmentResponse;
}

/* 약속 나가기 */
export async function leaveAppointment(
  appointmentId: string,
  init?: RequestInit,
) {
  const res = await fetch(
    buildAuthUrl(`/appointment/participant/${appointmentId}`),
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
    if (status_code === 401) {
      // 호스트는 나갈 수 없음
      throw new ApiError(API_ERROR_CODE.HOST_NOT_ALLOWED, message, 403);
    }
    if (status_code === 404) {
      // 참여 중인 유저가 아니거나 방이 없음
      throw new ApiError(API_ERROR_CODE.APPOINTMENT_NOT_EXISTED, message, 404);
    }
    const status = status_code ?? res.status;
    const msg = message ?? "Failed to leave the appointment";
    throw new ApiError("UNKNOWN", msg, status);
  }

  return;
}

/**
 * 약속 방 삭제
 * @param appointmentId
 */
export async function deleteAppointment(
  appointmentId: string,
  init?: RequestInit,
) {
  const res = await fetch(buildAuthUrl(`/appointment/${appointmentId}`), {
    ...init,
    method: "DELETE",
  });

  const resBody = await res.json();
  const { status_code, message, code } = resBody;

  if (!res.ok || status_code !== 200) {
    console.log(resBody);
    if (code) {
      throw new ApiError(code, message, res.status);
    }
    if (status_code === 401) {
      // 삭제 권한 없음 (호스트가 아님)
      throw new ApiError(API_ERROR_CODE.PERMISSION_DENIED, message, 403);
    }
    if (status_code === 404) {
      // 방이 존재하지 않음
      throw new ApiError(API_ERROR_CODE.APPOINTMENT_NOT_EXISTED, message, 404);
    }
    const status = status_code ?? res.status;
    const msg = message ?? "Failed to delete the appointment";
    throw new ApiError("UNKNOWN", msg, status);
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
  const res = await fetch(buildAuthUrl(`/appointment/info/${appointmentId}`), {
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
      //해당 방이 존재하지 않음
      throw new ApiError(API_ERROR_CODE.APPOINTMENT_NOT_EXISTED, message, 404);
    }
    const status = status_code ?? res.status;
    const msg = message ?? "Failed to get the preview of the appointment";
    throw new ApiError("UNKNOWN", msg, status);
  }
  return resBody.data as TAppointmentPreviewResponse;
}
