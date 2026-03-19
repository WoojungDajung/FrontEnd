import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getDateVoteStatusByUser } from "../api/getDateVoteStatusByUser";
import { TDateVoteByUserResponse } from "../types";

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
      getDateVoteStatusByUser(queryKey[1] as string, queryKey[2] as number),
    ...queryOptions,
    meta: { requiresAuth: true },
  });
};

export default useDateVoteStatusByUserQuery;
