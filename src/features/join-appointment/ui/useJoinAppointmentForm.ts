import { Place } from "@/src/shared/types";
import useJoinAppointment from "../hooks/useJoinAppointment";

const useJoinAppointmentForm = (appointmentId: string) => {
  const { mutate, isPending, isSuccess, reset } =
    useJoinAppointment(appointmentId);

  const submitForm = (
    data: {
      nickName: string;
      startingPlace: Place | undefined;
    },
    options?: {
      onSubmitSuccess?: (appointmentId: string) => void;
      onSubmitError?: () => void;
    },
  ) => {
    const { nickName, startingPlace } = data;
    mutate(
      { nickName, startingPlace },
      {
        onSuccess: (appointmentId) => {
          options?.onSubmitSuccess?.(appointmentId);
        },
        onError: () => {
          reset();
          options?.onSubmitError?.();
        },
      },
    );
  };

  return {
    submitForm,
    isSubmitPending: isPending,
    isSubmitSuccess: isSuccess,
  };
};

export default useJoinAppointmentForm;
