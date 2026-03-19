import { useQuery } from "@tanstack/react-query";
import { getMemberAppointments } from "../api/getMemberAppointments";

const useMemberAppointmentQuery = () => {
  return useQuery({
    queryKey: ["member-appointments"],
    queryFn: getMemberAppointments,
    meta: { requiresAuth: true },
  });
};

export default useMemberAppointmentQuery;
