import { useQuery } from "@tanstack/react-query";
import { getMyVoteLocation } from "../api/getMyVoteLocation";

const useMyVoteLocationQuery = (appointmentId: string) => {
  return useQuery({
    queryKey: ["my-vote-appointment-location", appointmentId],
    queryFn: ({ queryKey }) => getMyVoteLocation(queryKey[1]),
    meta: { requiresAuth: true },
  });
};

export default useMyVoteLocationQuery;
