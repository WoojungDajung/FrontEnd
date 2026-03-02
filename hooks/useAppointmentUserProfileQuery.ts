/* 약속방에서 설정한 유저의 프로필 */
import { getMemberProfile } from "@/api/member";
import { useQuery } from "@tanstack/react-query";

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
