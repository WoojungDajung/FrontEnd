import { getMemberAppointments } from "@/api/member";
import { useQuery } from "@tanstack/react-query";

const useMemberAppointmentQuery = () => {
  return useQuery({
    queryKey: ["member-appointments"],
    queryFn: getMemberAppointments,
    meta: { requiresAuth: true },
  });
};

export default useMemberAppointmentQuery;
