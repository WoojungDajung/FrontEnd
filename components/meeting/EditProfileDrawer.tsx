import BottomDrawer from "../shared/BottomDrawer";
import Button from "../shared/Button";
import DefaultDrawerLayout from "../shared/DefaultDrawerLayout";
import FormField from "../shared/FormField";
import { MemberProfile } from "@/types/apiResponse";
import { getAddressLngLat } from "@/api/kakao-local";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerMemberProfile } from "@/api/member";
import useLeaveAppointment from "@/hooks/useLeaveAppointment";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../shared/LoadingSpinner";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import AddressInput from "../shared/AddressInput";
import { Place } from "@/types/shared";
import { cn } from "@/utils/cn";
import { useEffect, useEffectEvent } from "react";

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
  appointmentHostId: number;
  initialProfile: MemberProfile;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

interface FormValue {
  nickName: string;
  startingPlace: Place | null;
}

const EditProfileDrawer = ({
  appointmentId,
  appointmentHostId,
  initialProfile,
  open,
  setOpen,
}: EditProfileDrawerProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    control,
    formState: { isValid, errors, dirtyFields },
    handleSubmit,
    reset: resetForm,
  } = useForm<FormValue>({
    mode: "onChange",
    defaultValues: profileToFormValue(initialProfile),
  });

  const updateDefaultValues = useEffectEvent((values: FormValue) => {
    resetForm(values);
  });
  useEffect(() => {
    updateDefaultValues(profileToFormValue(initialProfile));
  }, [initialProfile]);

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

      await registerMemberProfile(appointmentId, nickName, place);
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
          await queryClient.invalidateQueries({
            queryKey: ["appointment-user-profile", appointmentId],
          });
          await queryClient.invalidateQueries({
            queryKey: ["appointment", appointmentId],
          });

          // closeModal();
        },
        onError: () => {
          alert("프로필 수정에 실패하였습니다. 잠시후 다시 시도해주세요.");
        },
      },
    );
  };

  /* 약속 나가기 */
  const canLeave = initialProfile.id !== appointmentHostId;

  const { mutate: mutateLeave } = useLeaveAppointment(appointmentId);

  const leaveAppointment = () => {
    mutateLeave(undefined, {
      onSuccess: () => {
        router.push("/appointments");
      },
      onError: () => {
        alert("약속 나가기에 실패했습니다. 잠시후 다시 시도해주세요.");
      },
    });
  };

  const onVisibleChange = (visibility: boolean) => {
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
          title="내 정보"
          secondaryAction={
            canLeave
              ? { label: "약속 나가기", onClick: leaveAppointment }
              : undefined
          }
          close={close}
        >
          <form
            className="flex flex-col gap-40"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="mt-16 flex flex-col gap-16">
              <FormField label="이름" required inputId="nickName">
                <div
                  className={cn(
                    "input-container",
                    errors.nickName && "input-container--error",
                  )}
                >
                  <input
                    className="input w-full typo-16-regular"
                    {...register("nickName", { required: true, maxLength: 14 })}
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
            <Button className="w-full" size="Large" disabled={!isValid}>
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
          </form>
        </DefaultDrawerLayout>
      )}
    </BottomDrawer>
  );
};

export default EditProfileDrawer;
