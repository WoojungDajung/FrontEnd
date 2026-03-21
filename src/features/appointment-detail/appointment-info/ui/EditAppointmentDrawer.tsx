import { useRouter } from "next/navigation";
import { useToastStore } from "@/src/shared/toast/toastStore";
import { useConfirmStore } from "@/src/shared/confirm/confirmStore";
import BottomDrawer from "@/src/shared/ui/BottomDrawer";
import DefaultDrawerLayout from "@/src/shared/ui/layouts/DefaultDrawerLayout";
import LoadingSpinner from "@/src/shared/ui/LoadingSpinner";
import useDeleteAppointment from "../hooks/useDeleteAppointment";
import EditAppointmentForm from "./EditAppointmentForm";

interface EditAppointmentDrawerProps {
  appointmentId: string;
  initialName: string;
  initialDueDate: string; // YYYY-MM-DD
  open?: boolean;
  setOpen?: (open: boolean) => void;
  isHost: boolean;
  isConfirmed: boolean;
}

const EditAppointmentDrawer = ({
  appointmentId,
  initialName,
  initialDueDate,
  open,
  setOpen,
  isHost,
  isConfirmed,
}: EditAppointmentDrawerProps) => {
  const router = useRouter();
  const confirm = useConfirmStore((state) => state.confirm);
  const toast = useToastStore((state) => state.toast);

  /* 약속 없애기 */
  const deleteMutation = useDeleteAppointment(appointmentId);

  const onClickDeleteBtn = async () => {
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

  return (
    <BottomDrawer open={open} onOpenChange={setOpen}>
      {({ close }) => (
        <DefaultDrawerLayout
          title="약속 정보"
          secondaryAction={
            isHost
              ? { label: "약속 없애기", onClick: onClickDeleteBtn }
              : undefined
          }
          close={close}
        >
          {open && (
            <EditAppointmentForm
              appointmentId={appointmentId}
              initialName={initialName}
              initialDeadline={initialDueDate}
              onSubmitSuccess={() => {
                close();
              }}
              meta={{ isHost, isConfirmed }}
            />
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
