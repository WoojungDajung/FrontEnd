import { getVoteStatus } from "@/api/date";
import { useQuery } from "@tanstack/react-query";

interface useDateVoteQueryProps {
  appointmentId: string;
}

const useDateVoteQuery = ({ appointmentId }: useDateVoteQueryProps) => {
  return useQuery({
    queryKey: ["date-vote-status", appointmentId],
    queryFn: ({ queryKey }) => getVoteStatus(queryKey[1]),
    meta: { requiresAuth: true },
  });
};

export default useDateVoteQuery;
