import { leaveAppointment } from "@/api/appointment";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/* 약속 나가기 */
const useLeaveAppointment = (appointmentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => leaveAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member-appointments"] });
    },
  });
};

export default useLeaveAppointment;
