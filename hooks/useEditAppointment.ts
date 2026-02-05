import { editAppointment } from "@/api/appointment";
import { useMutation } from "@tanstack/react-query";

interface useEditAppointmentProps {
  appointmentId: string;
}

const useEditAppointment = ({ appointmentId }: useEditAppointmentProps) => {
  return useMutation({
    mutationFn: async ({
      appointmentName,
      appointmentDueDate,
    }: {
      appointmentName: string;
      appointmentDueDate: Date;
    }) => editAppointment(appointmentId, appointmentName, appointmentDueDate),
  });
};

export default useEditAppointment;
