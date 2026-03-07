import BottomDrawer from "../shared/BottomDrawer";
import Button from "../shared/Button";
import DefaultDrawerLayout from "../shared/DefaultDrawerLayout";
import FormField from "../shared/FormField";
import { MemberProfile } from "@/types/apiResponse";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMemberProfile } from "@/api/member";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../shared/LoadingSpinner";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import AddressInput from "../shared/AddressInput";
import { Place } from "@/types/shared";
import { cn } from "@/utils/cn";
import { useCallback } from "react";
import useLeaveAppointment from "@/hooks/useLeaveAppointment";
import { useConfirm } from "@/context/ConfirmContext";
import { useToast } from "@/context/ToastContext";
import { getAddressLngLat } from "@/api/address";

async function transformPlace(place: Place): Promise<{
  address: string;
  startingPlace: string;
  longitude: string;
  latitude: string;
}> {
  const { longitude, latitude } = await getAddressLngLat(place.address);
  return {
    address: place.address,
    startingPlace: place.placeName ?? place.address,
    longitude,
    latitude,
  };
}

function profileToFormValue(profile: MemberProfile): FormValue {
  return {
    nickName: profile.memberNickName ?? "",
    // 사용자가 기존에 입력 안 한 경우, 빈 문자열 "" -> null 처리
    startingPlace: profile.startingPlace
      ? {
          address: profile.startingPlace,
        }
      : null,
  };
}

interface EditProfileDrawerProps {
  appointmentId: string;
  initialProfile: MemberProfile;
  canLeaveAppointment: boolean;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

interface FormValue {
  nickName: string;
  startingPlace: Place | null;
}

const EditProfileDrawer = ({
  appointmentId,
  initialProfile,
  canLeaveAppointment,
  open,
  setOpen,
}: EditProfileDrawerProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const confirm = useConfirm();
  const { toast } = useToast();

  const {
    register,
    control,
    formState: { isValid, errors, isDirty, dirtyFields },
    handleSubmit,
    reset,
  } = useForm<FormValue>({
    mode: "onChange",
    defaultValues: profileToFormValue(initialProfile),
  });

  const resetForm = useCallback(() => {
    reset(profileToFormValue(initialProfile));
  }, [reset, initialProfile]);

  /* 저장하기 */
  const saveMutation = useMutation({
    mutationFn: async ({
      nickName,
      startingPlace,
    }: {
      nickName: string;
      startingPlace?: Place | null;
    }) => {
      const place = startingPlace
        ? await transformPlace(startingPlace)
        : startingPlace;

      await updateMemberProfile(appointmentId, nickName, place);
    },
  });

  const onSubmit: SubmitHandler<FormValue> = (data) => {
    const { nickName, startingPlace } = data;

    // dirtyFields.startingPlace !== true -> 변화 없음
    // 이 경우 출발 장소는 업데이트 X => undefined 처리
    const placeVal = dirtyFields.startingPlace ? startingPlace : undefined;

    saveMutation.mutate(
      { nickName, startingPlace: placeVal },
      {
        onSuccess: async () => {
          toast({ message: "저장이 완료됐어요." });

          await queryClient.invalidateQueries({
            queryKey: ["appointment-user-profile", appointmentId],
          });
          await queryClient.invalidateQueries({
            queryKey: ["appointment", appointmentId],
          });
        },
        onError: () => {
          toast({ message: "저장에 실패했어요. 잠시후 다시 시도해주세요." });
          saveMutation.reset();
        },
      },
    );
  };

  /* 약속 나가기 */
  const leaveMutation = useLeaveAppointment(appointmentId);

  const leaveAppointment = async () => {
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

  const onVisibleChange = (visibility: boolean) => {
    if (!visibility) {
      resetForm();
    }
  };

  const isSubmitBtnDisabled = !isValid || !isDirty;

  return (
    <BottomDrawer
      open={open}
      onOpenChange={setOpen}
      onVisibleChange={onVisibleChange}
    >
      {({ close }) => (
        <DefaultDrawerLayout
          title="내 정보"
          secondaryAction={
            canLeaveAppointment
              ? { label: "약속 나가기", onClick: leaveAppointment }
              : undefined
          }
          close={close}
        >
          <form
            className="h-full flex flex-col justify-between"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="mt-16 flex flex-col gap-16">
              <FormField label="이름" required inputId="nickName">
                <div
                  className={cn(
                    "input-container box-border h-56",
                    errors.nickName && "input-container--error",
                  )}
                >
                  <input
                    className="input w-full typo-16-regular"
                    {...register("nickName", { required: true, maxLength: 8 })}
                  />
                </div>
              </FormField>
              <FormField
                label="출발 장소"
                inputId="startingPlace"
                description="장소 투표 결과가 같을 경우, 모두의 출발지에서 가까운 중간 지점을 추천해 드려요."
              >
                <Controller
                  name="startingPlace"
                  control={control}
                  render={({ field }) => (
                    <AddressInput
                      inputId="startingPlace"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="서울 강서구 마곡동로 161"
                    />
                  )}
                />
              </FormField>
            </div>
            <Button
              className="w-full"
              size="Large"
              disabled={isSubmitBtnDisabled}
            >
              저장하기
            </Button>

            {(saveMutation.isPending || saveMutation.isSuccess) && (
              <div className="absolute inset-0 w-full h-full bg-white/40 grid place-items-center">
                <LoadingSpinner
                  size={40}
                  open={saveMutation.isPending || saveMutation.isSuccess}
                  success={saveMutation.isSuccess}
                  onClose={() => {
                    // 성공 표시 후 드로워가 닫히도록 하기
                    close();
                    saveMutation.reset();
                  }}
                />
              </div>
            )}

            {(leaveMutation.isPending || leaveMutation.isSuccess) && (
              <div className="absolute inset-0 w-full h-full bg-white/40 grid place-items-center">
                <LoadingSpinner
                  size={40}
                  open={leaveMutation.isPending || leaveMutation.isSuccess}
                  success={leaveMutation.isSuccess}
                />
              </div>
            )}
          </form>
        </DefaultDrawerLayout>
      )}
    </BottomDrawer>
  );
};

export default EditProfileDrawer;
