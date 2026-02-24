import BottomDrawer from "../shared/BottomDrawer";
import Button from "../shared/Button";
import DateInput from "../shared/DateInput";
import DefaultDrawerLayout from "../shared/DefaultDrawerLayout";
import FormField from "../shared/FormField";
import useEditAppointment from "@/hooks/useEditAppointment";
import LoadingSpinner from "../shared/LoadingSpinner";
import { useRouter } from "next/navigation";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { cn } from "@/utils/cn";
import { useConfirm } from "@/context/ConfirmContext";
import useDeleteAppointment from "@/hooks/useDeleteAppointment";
import { useToast } from "@/context/ToastContext";
import { useCallback } from "react";

interface EditAppointmentDrawerProps {
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

const EditAppointmentDrawer = ({
  appointmentId,
  initialName,
  initialDueDate,
  open,
  setOpen,
}: EditAppointmentDrawerProps) => {
  const router = useRouter();
  const confirm = useConfirm();
  const { toast } = useToast();

  const {
    register,
    control,
    formState: { isValid, errors },
    handleSubmit,
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      appointmentName: initialName,
      deadline: initialDueDate,
    },
    mode: "onChange",
  });

  const resetForm = useCallback(() => {
    reset({
      appointmentName: initialName,
      deadline: initialDueDate,
    });
  }, [reset, initialName, initialDueDate]);

  /* 약속 정보 수정 */
  const editMutation = useEditAppointment({
    appointmentId,
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const { appointmentName, deadline } = data;
    editMutation.mutate(
      { appointmentName, appointmentDueDate: deadline },
      {
        onSuccess: () => {
          toast({ message: "저장이 완료됐어요." });
        },
        onError: (error) => {
          console.log("약속 정보 수정 실패:", error);
          toast({ message: "저장에 실패했어요. 잠시후 다시 시도해주세요." });
          editMutation.reset();
        },
      },
    );
  };

  /* 약속 없애기 */
  const deleteMutation = useDeleteAppointment(appointmentId);

  const onClickAction = async () => {
    const result = await confirm({
      title: "약속 없애기",
      message: (
        <>
          정말 약속을 없애실 건가요?
          <br />
          링크를 통해 언제든 다시 약속을 만들 수 있어요.
        </>
      ),
      confirmText: "없애기",
      cancelText: "닫기",
      variant: "danger",
    });

    if (result) {
      deleteMutation.mutate(undefined, {
        onSuccess: () => {
          toast({ message: "삭제가 완료됐어요." });
          router.push("/appointments");
        },
        onError: () => {
          toast({ message: "삭제에 실패했어요. 잠시후 다시 시도해주세요." });
          deleteMutation.reset();
        },
      });
    }
  };

  const onVisibleChange = (visibility: boolean) => {
    // 닫으면 폼 초기값으로 되돌리기
    if (!visibility) {
      resetForm();
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
          secondaryAction={{
            label: "약속 없애기",
            // onClick: () => setDeleteModalOpen(true),
            onClick: onClickAction,
          }}
          close={close}
        >
          <form
            className="flex flex-col h-full justify-between"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="mt-16 flex flex-col gap-16">
              <FormField label="약속 이름" required inputId="appointmentName">
                <div
                  className={cn(
                    "input-container box-border h-56",
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

          {(deleteMutation.isPending || deleteMutation.isSuccess) && (
            <div className="absolute inset-0 w-full h-full bg-white/40 grid place-items-center">
              <LoadingSpinner
                size={40}
                open={deleteMutation.isPending}
                success={deleteMutation.isSuccess}
              />
            </div>
          )}
        </DefaultDrawerLayout>
      )}
    </BottomDrawer>
  );
};

export default EditAppointmentDrawer;
