import { getVoteStatusByMonth } from "@/api/date";
import { TDateVoteByMonthResponse } from "@/types/apiResponse";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import dayjs from "dayjs";

function formatDate(date: Date) {
  return dayjs(date).format("YYYY-MM");
}

export function getDateVoteStatusByMonthQueryOptions(
  appointmentId: string,
  month: Date,
): UseQueryOptions<
  TDateVoteByMonthResponse,
  Error,
  TDateVoteByMonthResponse,
  string[]
> {
  return {
    queryKey: ["date-vote-status-by-month", appointmentId, formatDate(month)],
    queryFn: ({ queryKey }) => getVoteStatusByMonth(queryKey[1], queryKey[2]),
    meta: { requiresAuth: true },
  };
}

const useDateVoteStatusByMonthQuery = (appointmentId: string, month: Date) => {
  return useQuery(getDateVoteStatusByMonthQueryOptions(appointmentId, month));
};

export default useDateVoteStatusByMonthQuery;
