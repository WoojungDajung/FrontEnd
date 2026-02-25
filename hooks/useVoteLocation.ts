import { voteLocation } from "@/api/location";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useVoteLocation = (appointmentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ placeIdList }: { placeIdList: number[] }) =>
      voteLocation(appointmentId, placeIdList),
    onSuccess: async (_, { placeIdList }) => {
      await Promise.all([
        // 투표 현황
        queryClient.invalidateQueries({
          queryKey: ["location-vote-status", appointmentId],
        }),
        // 사용자의 투표 현황
        queryClient.invalidateQueries({
          queryKey: ["my-vote-appointment-location", appointmentId],
        }),
        // 투표한 장소의 정보
        ...placeIdList.map((placeId) =>
          queryClient.invalidateQueries({
            queryKey: ["appointment-location", appointmentId, placeId],
          }),
        ),
        // 모든 장소 내역
        queryClient.invalidateQueries({
          queryKey: ["appointment-locations", appointmentId],
        }),
      ]);
    },
  });
};

export default useVoteLocation;
