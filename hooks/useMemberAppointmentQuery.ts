import { getMemberAppointments } from "@/api/member";
import { useQuery } from "@tanstack/react-query";

const useMemberAppointmentQuery = () => {
  return useQuery({
    queryKey: ["member-appointments"],
    queryFn: getMemberAppointments,
  });
};

export default useMemberAppointmentQuery;
