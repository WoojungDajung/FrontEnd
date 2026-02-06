import { deleteAppointment } from "@/api/appointment";
import { useMutation } from "@tanstack/react-query";

const useDeleteAppointment = (appointmentId: string) => {
  return useMutation({
    mutationFn: () => deleteAppointment(appointmentId),
  });
};

export default useDeleteAppointment;
