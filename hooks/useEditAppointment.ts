import { editAppointment } from "@/api/appointment";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface useEditAppointmentProps {
  appointmentId: string;
}

const useEditAppointment = ({ appointmentId }: useEditAppointmentProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentName,
      appointmentDueDate,
    }: {
      appointmentName: string;
      appointmentDueDate: string; // YYYY-MM-DD 형식의 문자열
    }) => editAppointment(appointmentId, appointmentName, appointmentDueDate),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["appointment", appointmentId],
      });
    },
  });
};

export default useEditAppointment;
