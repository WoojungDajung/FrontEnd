import BottomDrawer from "../shared/BottomDrawer";
import Button from "../shared/Button";
import DateInput from "../shared/DateInput";
import DefaultDrawerLayout from "../shared/DefaultDrawerLayout";
import FormField from "../shared/FormField";
import useEditAppointment from "@/hooks/useEditAppointment";
import LoadingSpinner from "../shared/LoadingSpinner";
import useDeleteAppointment from "@/hooks/useDeleteAppointment";
import { useRouter } from "next/navigation";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { cn } from "@/utils/cn";

interface EditMeetingDrawerProps {
  appointmentId: string;
  initialName: string;
  initialDueDate: Date;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

interface FormValues {
  appointmentName: string;
  deadline: Date;
}

const EditMeetingDrawer = ({
  appointmentId,
  initialName,
  initialDueDate,
  open,
  setOpen,
}: EditMeetingDrawerProps) => {
  const router = useRouter();

  const {
    register,
    control,
    formState: { isValid, errors },
    handleSubmit,
    reset: resetForm,
  } = useForm<FormValues>({
    defaultValues: {
      appointmentName: initialName,
      deadline: initialDueDate,
    },
    mode: "onChange",
  });

  const editMutation = useEditAppointment({
    appointmentId,
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const { appointmentName, deadline } = data;
    editMutation.mutate(
      { appointmentName, appointmentDueDate: deadline },
      {
        onSuccess: () => {
          // closeModal
        },
        onError: (error) => {
          alert(
            `약속 정보 수정에 실패하였습니다. 잠시후 다시 시도해 주세요. (${error.message})`,
          );
        },
      },
    );
  };

  /* 약속 방 삭제 */
  const deleteMutation = useDeleteAppointment(appointmentId);
  const deleteAppointment = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        router.push("/appointments");
      },
      onError: () => {
        alert("약속 삭제에 실패했습니다. 잠시후 다시 시도해주세요.");
      },
    });
  };

  const onVisibleChange = (visibility: boolean) => {
    // 닫으면 처음 상태로 되돌리기
    if (!visibility) {
      resetForm({
        appointmentName: initialName,
        deadline: initialDueDate,
      });
    }
  };

  return (
    <BottomDrawer
      open={open}
      onOpenChange={setOpen}
      onVisibleChange={onVisibleChange}
    >
      {({ close }) => (
        <DefaultDrawerLayout
          title="약속 정보"
          secondaryAction={{ label: "약속 없애기", onClick: deleteAppointment }}
          close={close}
        >
          <form
            className="flex flex-col gap-40"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="mt-16 flex flex-col gap-16">
              <FormField label="약속 이름" required inputId="appointmentName">
                <div
                  className={cn(
                    "input-container",
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
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  )}
                />
              </FormField>
            </div>
            <Button size="Large" disabled={!isValid}>
              등록하기
            </Button>
          </form>

          {(editMutation.isPending || editMutation.isSuccess) && (
            <div className="absolute inset-0 w-full h-full bg-white/40 grid place-items-center">
              <LoadingSpinner
                size={40}
                open={editMutation.isPending || editMutation.isSuccess}
                success={editMutation.isSuccess}
                onClose={() => {
                  // 성공 표시 후 드로워가 닫히도록 하기
                  close();
                  editMutation.reset();
                }}
              />
            </div>
          )}

          {deleteMutation.isPending && (
            <div className="absolute inset-0 w-full h-full bg-white/40 grid place-items-center">
              <LoadingSpinner size={40} open={deleteMutation.isPending} />
            </div>
          )}
        </DefaultDrawerLayout>
      )}
    </BottomDrawer>
  );
};

export default EditMeetingDrawer;
