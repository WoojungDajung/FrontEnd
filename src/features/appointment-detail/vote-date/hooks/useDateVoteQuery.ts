import { useQuery } from "@tanstack/react-query";
import { getDateVoteStatus } from "../api/getDateVoteStatus";

interface useDateVoteQueryProps {
  appointmentId: string;
}

const useDateVoteQuery = ({ appointmentId }: useDateVoteQueryProps) => {
  return useQuery({
    queryKey: ["date-vote-status", appointmentId],
    queryFn: ({ queryKey }) => getDateVoteStatus(queryKey[1]),
    meta: { requiresAuth: true },
  });
};

export default useDateVoteQuery;
