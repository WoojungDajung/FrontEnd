import { getVoteStatusByMonth } from "@/api/date";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

function formatDate(date: Date) {
  return dayjs(date).format("YYYY-MM");
}

const useDateVoteStatusByMonthByQuery = (
  appointmentId: string,
  month: Date,
) => {
  return useQuery({
    queryKey: ["date-vote-status-by-month", appointmentId, formatDate(month)],
    queryFn: ({ queryKey }) => getVoteStatusByMonth(queryKey[1], queryKey[2]),
  });
};

export default useDateVoteStatusByMonthByQuery;
