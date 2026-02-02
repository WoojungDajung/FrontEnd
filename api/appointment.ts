import { ERROR_MESSAGE } from "@/constants/error-message";
import { TAppointmentResponse } from "@/types/apiResponse";
import dayjs from "dayjs";

export async function getAppointment(appointmentId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/auth-api/appointment/${appointmentId}`,
    {
      method: "GET",
    },
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

  if (!res.ok) {
    const { status_code, message } = resBody;
    throw new Error(`${status_code}: ${message}`);
  }

  return resBody.data as TAppointmentResponse;
}

/* 약속 방 참여 */
export async function joinAppointment(
  appointmentId: string,
): Promise<TAppointmentResponse> {
  const res = await fetch(`/auth-api/appointment/join/${appointmentId}`, {
    method: "POST",
  });

  const resBody = await res.json();
  console.log(resBody);

  if (!res.ok) {
    if (res.status === 404) {
      // 해당 방이 존재하지 않음
    }
    const { status_code, message } = resBody;
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

  if (!res.ok) {
    if (res.status === 401) {
      // 호스트는 나갈 수 없음
    }
    if (res.status === 404) {
      // 참여 중인 유저가 아니거나 방이 없음
    }
    const { status_code, message } = resBody;
    throw new Error(`${status_code}: ${message}`);
  }

  return;
}
