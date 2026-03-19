import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteLocation } from "../api/deleteLocation";

const useDeleteLocation = (appointmentId: string, placeId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteLocation(appointmentId, placeId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["appointment-locations", appointmentId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["my-vote-appointment-location", appointmentId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["location-vote-status", appointmentId],
        }),
      ]);
    },
  });
};

export default useDeleteLocation;
