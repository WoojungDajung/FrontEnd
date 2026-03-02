import { getMyVoteLocation } from "@/api/location";
import { useQuery } from "@tanstack/react-query";

const useMyVoteLocationQuery = (appointmentId: string) => {
  return useQuery({
    queryKey: ["my-vote-appointment-location", appointmentId],
    queryFn: ({ queryKey }) => getMyVoteLocation(queryKey[1]),
    meta: { requiresAuth: true },
  });
};

export default useMyVoteLocationQuery;
