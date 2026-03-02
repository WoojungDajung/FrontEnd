import { getVoteStatusByUser } from "@/api/date";
import { TDateVoteByUserResponse } from "@/types/apiResponse";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

const useDateVoteStatusByUserQuery = (
  appointmentId: string,
  userId: number,
  queryOptions?: Omit<
    UseQueryOptions<
      TDateVoteByUserResponse,
      Error,
      TDateVoteByUserResponse,
      (string | number)[]
    >,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: ["date-vote-status-by-user", appointmentId, userId],
    queryFn: ({ queryKey }) =>
      getVoteStatusByUser(queryKey[1] as string, queryKey[2] as number),
    ...queryOptions,
    meta: { requiresAuth: true },
  });
};

export default useDateVoteStatusByUserQuery;
