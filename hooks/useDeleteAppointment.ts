import { deleteAppointment } from "@/api/appointment";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useDeleteAppointment = (appointmentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteAppointment(appointmentId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["member-appointments"] }),
  });
};

export default useDeleteAppointment;
