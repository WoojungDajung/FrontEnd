import { getAddressLngLat } from "@/api/address";
import { registerLocation } from "@/api/location";
import { Address } from "@/types/daum";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useRegisterLocation = (appointmentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ address }: { address: Address }) => {
      const placeName =
        address.buildingName !== "" ? address.buildingName : address.address;
      // 주소 좌표(경도,위도) 변환
      const { longitude, latitude } = await getAddressLngLat(address.address);
      // 장소 등록
      await registerLocation(
        appointmentId,
        placeName,
        address.address,
        latitude,
        longitude,
      );
    },
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

export default useRegisterLocation;
