import { useQuery } from "@tanstack/react-query";
import { getLocationVoteStatus } from "../api/getLocationVoteStatus";

const useLocationVoteStatusQuery = (appointmentId: string) => {
  return useQuery({
    queryKey: ["location-vote-status", appointmentId],
    queryFn: ({ queryKey }) => getLocationVoteStatus(queryKey[1]),
    meta: { requiresAuth: true },
  });
};

export default useLocationVoteStatusQuery;
