import { TAppointmentResponse } from "@/types/apiResponse";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";

const useCreateMeeting = () => {
  return useMutation({
    mutationFn: async ({
      meetingName,
      deadline,
    }: {
      meetingName: string;
      deadline: Date;
    }) => {
      const deadlineStr = dayjs(deadline).format("YYYY-MM-DD");

      const res = await fetch("/auth-api/appointment", {
        method: "POST",
        body: JSON.stringify({
          appointmentName: meetingName,
          appointmentDueDate: deadlineStr,
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

      console.log("약속 방 생성 성공:", resBody);
      return resBody.data as TAppointmentResponse;
    },
  });
};

export default useCreateMeeting;
