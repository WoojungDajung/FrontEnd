import { useQuery } from "@tanstack/react-query";
import { getMemberProfile } from "../api/getMemberProfile";

interface useAppointmentUserProfileQueryProps {
  appointmentId: string;
}

const useAppointmentUserProfileQuery = ({
  appointmentId,
}: useAppointmentUserProfileQueryProps) => {
  return useQuery({
    queryKey: ["appointment-user-profile", appointmentId],
    queryFn: ({ queryKey }) => getMemberProfile(queryKey[1]),
    meta: { requiresAuth: true },
  });
};

export default useAppointmentUserProfileQuery;
