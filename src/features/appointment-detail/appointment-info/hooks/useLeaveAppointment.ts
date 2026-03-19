import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveAppointment } from "../api/leaveAppointment";

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
