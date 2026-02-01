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
  if (!res.ok) {
    const { status_code, message } = resBody;
    throw new Error(`${status_code}: ${message}`);
  }

  console.log(resBody);
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
export async function joinAppointment(appointmentId: string): Promise<TAppointmentResponse> {
  const res = await fetch(`/auth-api/appointment/join/${appointmentId}`, {
    method: "POST"
  })

  const resBody = await res.json();
  console.log(resBody);

  if (!res.ok) {
    if (res.status === 404) {
      // 해당 방이 존재하지 않음
    }
        const { status_code, message } = resBody;
    throw new Error(`${status_code}: ${message}`);
  }

  return resBody.data as TAppointmentResponse
}