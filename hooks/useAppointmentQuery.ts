import { getAppointment } from "@/api/appointment";
import { useQuery } from "@tanstack/react-query";

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
