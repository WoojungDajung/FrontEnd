import { getVoteStatusByYMD } from "@/api/date";
import { dateToString } from "@/utils/calendar";
import { useQuery } from "@tanstack/react-query";

const useDateVoteStatusByYMDQuery = (appointmentId: string, date: Date) => {
  return useQuery({
    queryKey: ["date-vote-status-by-ymd", appointmentId, dateToString(date)],
    queryFn: ({ queryKey }) => getVoteStatusByYMD(queryKey[1], queryKey[2]),
    meta: { requiresAuth: true },
  });
};

export default useDateVoteStatusByYMDQuery;
