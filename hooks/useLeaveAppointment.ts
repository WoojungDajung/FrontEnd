import { leaveAppointment } from "@/api/appointment";
import { useMutation } from "@tanstack/react-query";

/* 약속 나가기 */
const useLeaveAppointment = (appointmentId: string) => {
  return useMutation({
    mutationFn: () => leaveAppointment(appointmentId),
  });
};

export default useLeaveAppointment;
