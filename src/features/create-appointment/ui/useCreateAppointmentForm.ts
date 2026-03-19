import { Place } from "@/src/shared/types";
import useCreateAppointment from "../hooks/useCreateAppointment";
import { sendGTM } from "@/src/shared/lib/googleTagManager/sendGTM";
import { dateToString } from "@/src/shared/utils/calendar";

const useCreateAppointmentForm = () => {
  const { mutate, isPending, reset } = useCreateAppointment();

  const submitForm = (
    data: {
      appointmentName: string;
      deadline: Date;
      nickName: string;
      startingPlace: Place | undefined;
    },
    options?: {
      onSubmitSucces?: (appointmentId: string) => void;
      onSubmitError?: () => void;
    },
  ) => {
    mutate(data, {
      onSuccess: (appointmentId) => {
        // 약속 페이지로 이동
        sendGTM({
          event: "create_appointment",
          appointment_id: appointmentId,
          deadline_time: dateToString(data.deadline),
        });
        options?.onSubmitSucces?.(appointmentId);
      },
      onError: () => {
        reset();
        options?.onSubmitError?.();
      },
    });
  };

  return {
    submitForm,
    isSubmitting: isPending,
  };
};

export default useCreateAppointmentForm;
