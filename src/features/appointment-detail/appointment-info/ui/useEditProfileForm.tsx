import { getAddressLngLat } from "@/src/shared/api/getAddressLngLat";
import { Place } from "@/src/shared/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMemberProfile } from "../api/updateMemberProfile";

async function transformPlace(place: Place): Promise<{
  address: string;
  startingPlace: string;
  longitude: string;
  latitude: string;
}> {
  const { longitude, latitude } = await getAddressLngLat(place.address);
  return {
    address: place.address,
    startingPlace: place.placeName ?? place.address,
    longitude,
    latitude,
  };
}

const useEditProfileForm = (appointmentId: string) => {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async ({
      nickName,
      startingPlace,
    }: {
      nickName: string;
      startingPlace?: Place | null;
    }) => {
      const place = startingPlace
        ? await transformPlace(startingPlace)
        : startingPlace;

      await updateMemberProfile(appointmentId, nickName, place);
    },
  });

  const submitForm = (
    data: {
      nickName: string;
      startingPlace: Place | null | undefined;
    },
    options?: {
      onSubmitSuccess?: () => void;
      onSubmitError?: () => void;
    },
  ) => {
    const { nickName, startingPlace } = data;
    saveMutation.mutate(
      { nickName, startingPlace },
      {
        onSuccess: async () => {
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: ["appointment-user-profile", appointmentId],
            }),
            queryClient.invalidateQueries({
              queryKey: ["appointment", appointmentId],
            }),
          ]);
          options?.onSubmitSuccess?.();
        },
        onError: () => {
          saveMutation.reset();
          options?.onSubmitError?.();
        },
      },
    );
  };

  return {
    submitForm,
    isSubmitPending: saveMutation.isPending,
    isSubmitSuccess: saveMutation.isSuccess,
  };
};

export default useEditProfileForm;
