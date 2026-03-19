import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAppointment } from "../api/deleteAppointment";

const useDeleteAppointment = (appointmentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteAppointment(appointmentId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["member-appointments"] }),
  });
};

export default useDeleteAppointment;
