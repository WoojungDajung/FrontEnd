import { deleteLocation } from "@/api/location";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useDeleteLocation = (appointmentId: string, placeId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteLocation(appointmentId, placeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["appointment-locations", appointmentId],
      });
    },
  });
};

export default useDeleteLocation;
