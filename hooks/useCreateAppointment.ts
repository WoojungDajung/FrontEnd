import { getAddressLngLat } from "@/api/address";
import { createAppointment } from "@/api/appointment";
import { Place } from "@/types/shared";
import { dateToString } from "@/utils/calendar";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentName,
      deadline,
      nickName,
      startingPlace,
    }: {
      appointmentName: string;
      deadline: Date;
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

      const appointment = await createAppointment(
        appointmentName,
        dateToString(deadline),
        nickName,
        place,
      );
      return appointment.appointment.appointmentId;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["member-appointments"] });
    },
  });
};

export default useCreateAppointment;
