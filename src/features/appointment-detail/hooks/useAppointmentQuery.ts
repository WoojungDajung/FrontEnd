import { useQuery } from "@tanstack/react-query";
import { getAppointment } from "../api/getAppointment";

interface useAppointmentQueryProps {
  appointmentId: string;
}

const useAppointmentQuery = ({ appointmentId }: useAppointmentQueryProps) => {
  return useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: ({ queryKey }) => getAppointment(queryKey[1]),
    meta: { requiresAuth: true },
  });
};

export default useAppointmentQuery;
