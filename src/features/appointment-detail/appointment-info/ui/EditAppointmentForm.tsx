import { Controller, SubmitHandler, useForm } from "react-hook-form";
import useEditAppointment from "../hooks/useEditAppointment";
import { EditAppointmentEventData } from "@/src/shared/lib/googleTagManager/gtmEventDataTypes";
import { sendGTM } from "@/src/shared/lib/googleTagManager/sendGTM";
import FormField from "@/src/shared/ui/FormField";
import { cn } from "@/src/shared/utils/cn";
import DateInput from "@/src/shared/ui/DateInput";
import { dateToString, stringToDate } from "@/src/shared/utils/calendar";
import Button from "@/src/shared/ui/Button";
import LoadingSpinner from "@/src/shared/ui/LoadingSpinner";
import useEditAppointmentForm from "./useEditAppointmentForm";
import { useToastStore } from "@/src/shared/toast/toastStore";

interface FormValues {
  appointmentName: string;
  deadline: string; // YYYY-MM-DD
}

interface EditAppointmentFormProps {
  appointmentId: string;
  initialName: string;
  initialDeadline: string; // YYYY-MM-DD
  onSubmitSuccess?: () => void;
  meta: {
    isHost: boolean;
    isConfirmed: boolean;
  };
}

const EditAppointmentForm = ({
  appointmentId,
  initialName,
  initialDeadline,
  onSubmitSuccess,
  meta,
}: EditAppointmentFormProps) => {
  const toast = useToastStore((state) => state.toast);

  const {
    register,
    control,
    formState: { isValid, errors, isDirty, dirtyFields },
    handleSubmit,
  } = useForm<FormValues>({
    defaultValues: {
      appointmentName: initialName,
      deadline: initialDeadline,
    },
    mode: "onChange",
  });

  const { submitForm, isSubmitPending, isSubmitSuccess } =
    useEditAppointmentForm(appointmentId);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const { appointmentName, deadline } = data;
    submitForm(
      { appointmentName, appointmentDueDate: deadline },
      {
        isHost: meta.isHost,
        isConfirmed: meta.isConfirmed,
        isNameEdited: dirtyFields.appointmentName ?? false,
        isDeadlineEdited: dirtyFields.deadline ?? false,
      },
      {
        onSubmitSuccess: () => {
          toast({ message: "저장이 완료됐어요." });
        },
        onSubmitError: () => {
          toast({ message: "저장에 실패했어요. 잠시후 다시 시도해주세요." });
        },
      },
    );
  };

  const isSubmitBtnDisabled = !isValid || !isDirty;

  return (
    <>
      <form
        className="flex flex-col h-full justify-between"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="mt-16 flex flex-col gap-16">
          <FormField label="약속 이름" required inputId="appointmentName">
            <div
              className={cn(
                "input-container box-border py-0 h-56 flex items-center",
                errors.appointmentName && "input-container--error",
              )}
            >
              <input
                className="input w-full typo-16-regular"
                {...register("appointmentName", {
                  required: true,
                  maxLength: 14,
                })}
              />
            </div>
          </FormField>
          <FormField
            label="투표 마감일"
            inputId="deadline"
            description="참여자들은 지정된 마감일 자정까지 투표할 수 있어요."
          >
            <Controller
              name="deadline"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <DateInput
                  value={stringToDate(field.value)}
                  onValueChange={(value) =>
                    field.onChange(value ? dateToString(value) : undefined)
                  }
                />
              )}
            />
          </FormField>
        </div>
        <Button
          id="btn_save_appointment"
          size="Large"
          disabled={isSubmitBtnDisabled}
        >
          등록하기
        </Button>
      </form>

      {(isSubmitPending || isSubmitSuccess) && (
        <div className="absolute inset-0 w-full h-full bg-white/40 grid place-items-center">
          <LoadingSpinner
            size={40}
            open={isSubmitPending || isSubmitSuccess}
            success={isSubmitSuccess}
            onClose={() => {
              // 성공 표시 후 드로워가 닫히도록 하기
              onSubmitSuccess?.();
            }}
          />
        </div>
      )}
    </>
  );
};

export default EditAppointmentForm;
