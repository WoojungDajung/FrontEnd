import { useMutation, useQueryClient } from "@tanstack/react-query";
import { voteDate } from "../api/voteDate";

const useVoteDate = (appointmentId: string, userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      votes,
    }: {
      votes: { date: string; type: "POSSIBLE" | "IMPOSSIBLE" | "UNCERTAIN" }[];
    }) => voteDate(appointmentId, votes),
    onSuccess: async (_, { votes }) => {
      await queryClient.invalidateQueries({
        queryKey: ["date-vote-status", appointmentId],
      });

      const months = new Set<string>();
      for (const vote of votes) {
        months.add(vote.date.slice(0, "YYYY-MM".length));
      }
      for (const month of months) {
        await queryClient.invalidateQueries({
          queryKey: ["date-vote-status-by-month", appointmentId, month],
        });
      }
      await queryClient.invalidateQueries({
        queryKey: ["date-vote-status-by-user", appointmentId, userId],
      });
    },
  });
};

export default useVoteDate;
