import { getLocationVoteStatus } from "@/api/location";
import { useQuery } from "@tanstack/react-query";

const useLocationVoteStatusQuery = (appointmentId: string) => {
  return useQuery({
    queryKey: ["location-vote-status", appointmentId],
    queryFn: ({ queryKey }) => getLocationVoteStatus(queryKey[1]),
  });
};

export default useLocationVoteStatusQuery;
