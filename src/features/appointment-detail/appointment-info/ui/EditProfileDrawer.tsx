import { useRouter } from "next/navigation";
import { useToastStore } from "@/src/shared/toast/toastStore";
import { useConfirmStore } from "@/src/shared/confirm/confirmStore";
import BottomDrawer from "@/src/shared/ui/BottomDrawer";
import DefaultDrawerLayout from "@/src/shared/ui/layouts/DefaultDrawerLayout";
import { MemberProfile } from "../../types";
import useLeaveAppointment from "../hooks/useLeaveAppointment";
import EditProfileForm from "./EditProfileForm";
import LoadingSpinner from "@/src/shared/ui/LoadingSpinner";

interface EditProfileDrawerProps {
  appointmentId: string;
  initialProfile: MemberProfile;
  canLeaveAppointment: boolean;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const EditProfileDrawer = ({
  appointmentId,
  initialProfile,
  canLeaveAppointment,
  open,
  setOpen,
}: EditProfileDrawerProps) => {
  const router = useRouter();
  const confirm = useConfirmStore((state) => state.confirm);
  const toast = useToastStore((state) => state.toast);

  /* 약속 나가기 */
  const leaveMutation = useLeaveAppointment(appointmentId);

  const onClickLeaveBtn = async () => {
    const result = await confirm({
      title: "약속나가기",
      message: (
        <>
          정말 약속을 나가실 건가요?
          <br />
          링크를 통해 언제든 다시 참석할 수 있어요.
        </>
      ),
      confirmText: "나가기",
      cancelText: "닫기",
      variant: "danger",
    });

    if (result) {
      leaveMutation.mutate(undefined, {
        onSuccess: () => {
          router.push("/appointments");
        },
        onError: () => {
          toast({
            message: "약속나가기에 실패했어요. 잠시후 다시 시도해주세요.",
          });
          leaveMutation.reset();
        },
      });
    }
  };

  return (
    <BottomDrawer open={open} onOpenChange={setOpen}>
      {({ close }) => (
        <DefaultDrawerLayout
          title="내 정보"
          secondaryAction={
            canLeaveAppointment
              ? { label: "약속 나가기", onClick: onClickLeaveBtn }
              : undefined
          }
          close={close}
        >
          {open && (
            <EditProfileForm
              appointmentId={appointmentId}
              initialProfile={initialProfile}
              onSubmitSuccess={() => {
                close();
              }}
            />
          )}

          {(leaveMutation.isPending || leaveMutation.isSuccess) && (
            <div className="absolute inset-0 w-full h-full bg-white/40 grid place-items-center">
              <LoadingSpinner
                size={40}
                open
                success={leaveMutation.isSuccess}
                onClose={() => {
                  leaveMutation.reset();
                }}
              />
            </div>
          )}
        </DefaultDrawerLayout>
      )}
    </BottomDrawer>
  );
};

export default EditProfileDrawer;
