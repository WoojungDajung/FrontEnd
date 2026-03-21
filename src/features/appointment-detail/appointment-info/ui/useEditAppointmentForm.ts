import { EditAppointmentEventData } from "@/src/shared/lib/googleTagManager/gtmEventDataTypes";
import useEditAppointment from "../hooks/useEditAppointment";
import { sendGTM } from "@/src/shared/lib/googleTagManager/sendGTM";

const useEditAppointmentForm = (appointmentId: string) => {
  const editMutation = useEditAppointment({ appointmentId });

  const submitForm = (
    data: {
      appointmentName: string;
      appointmentDueDate: string;
    },
    meta: {
      isHost: boolean;
      isConfirmed: boolean;
      isNameEdited: boolean;
      isDeadlineEdited: boolean;
    },
    options?: {
      onSubmitSuccess?: () => void;
      onSubmitError?: () => void;
    },
  ) => {
    const { appointmentName, appointmentDueDate } = data;
    editMutation.mutate(
      { appointmentName, appointmentDueDate },
      {
        onSuccess: () => {
          // 구글 태그 매니저 이벤트 전송
          const gtmEventData: EditAppointmentEventData = {
            event: "edit_appointment",
            appointment_id: appointmentId,
            user_role: meta.isHost ? "host" : "guest",
            edit_name: meta.isNameEdited,
            edit_deadline: meta.isDeadlineEdited,
            is_after_deadline: meta.isConfirmed,
          };
          sendGTM(gtmEventData);

          options?.onSubmitSuccess?.();
        },
        onError: () => {
          editMutation.reset();
          options?.onSubmitError?.();
        },
      },
    );
  };

  return {
    submitForm,
    isSubmitPending: editMutation.isPending,
    isSubmitSuccess: editMutation.isSuccess,
  };
};

export default useEditAppointmentForm;
