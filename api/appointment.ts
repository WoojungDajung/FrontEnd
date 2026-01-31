import { TAppointmentResponse } from "@/types/apiResponse";

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

  console.log(resBody)
  return resBody.data as TAppointmentResponse;
}
