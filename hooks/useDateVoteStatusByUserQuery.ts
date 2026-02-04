import { getVoteStatusByUser } from "@/api/date";
import { useQuery } from "@tanstack/react-query";

const useDateVoteStatusByUserQuery = (
  appointmentId: string,
  userId: number,
) => {
  return useQuery({
    queryKey: ["date-vote-status-by-user", appointmentId, userId],
    queryFn: ({ queryKey }) =>
      getVoteStatusByUser(queryKey[1] as string, queryKey[2] as number),
  });
};

export default useDateVoteStatusByUserQuery;
