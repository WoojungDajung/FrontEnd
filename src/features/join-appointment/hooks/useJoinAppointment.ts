import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAddressLngLat } from "@/src/shared/api/getAddressLngLat";
import { joinAppointment } from "../api/joinAppointment";
import { Place } from "@/src/shared/types";

const useJoinAppointment = (appointmentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nickName,
      startingPlace,
    }: {
      nickName: string;
      startingPlace?: Place;
    }) => {
      let place = null;
      if (startingPlace) {
        const { longitude, latitude } = await getAddressLngLat(
          startingPlace.address,
        );
        place = {
          address: startingPlace.address,
          startingPlace: startingPlace.placeName ?? startingPlace.address,
          longitude,
          latitude,
        };
      }

      const appointment = await joinAppointment(appointmentId, nickName, place);
      return appointment.appointment.appointmentId;
    },
    onSuccess: async (appointmentId) => {
      await queryClient.invalidateQueries({
        queryKey: ["member-appointments"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["appointment", appointmentId],
      });
    },
  });
};

export default useJoinAppointment;
