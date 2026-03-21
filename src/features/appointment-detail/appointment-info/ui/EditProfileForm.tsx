import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Place } from "@/src/shared/types";
import FormField from "@/src/shared/ui/FormField";
import { useToastStore } from "@/src/shared/toast/toastStore";
import { cn } from "@/src/shared/utils/cn";
import AddressInput from "@/src/shared/ui/AddressInput";
import Button from "@/src/shared/ui/Button";
import LoadingSpinner from "@/src/shared/ui/LoadingSpinner";
import { MemberProfile } from "../../types";
import useEditProfileForm from "./useEditProfileForm";

interface FormValue {
  nickName: string;
  startingPlace: Place | null;
}

interface EditProfileFormProps {
  appointmentId: string;
  initialProfile: MemberProfile;
  onSubmitSuccess?: () => void;
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

const EditProfileForm = ({
  appointmentId,
  initialProfile,
  onSubmitSuccess,
}: EditProfileFormProps) => {
  const toast = useToastStore((state) => state.toast);

  const {
    register,
    control,
    formState: { isValid, errors, isDirty, dirtyFields },
    handleSubmit,
  } = useForm<FormValue>({
    mode: "onChange",
    defaultValues: profileToFormValue(initialProfile),
  });

  const { submitForm, isSubmitPending, isSubmitSuccess } =
    useEditProfileForm(appointmentId);

  const onSubmit: SubmitHandler<FormValue> = (data) => {
    const { nickName, startingPlace } = data;

    // dirtyFields.startingPlace !== true -> 변화 없음
    // 이 경우 출발 장소는 업데이트 X => undefined 처리
    const placeVal = dirtyFields.startingPlace ? startingPlace : undefined;
    submitForm(
      { nickName, startingPlace: placeVal },
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
        className="h-full flex flex-col justify-between"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="mt-16 flex flex-col gap-16">
          <FormField label="이름" required inputId="nickName">
            <div
              className={cn(
                "input-container box-border py-0 h-56 flex items-center",
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
        <Button className="w-full" size="Large" disabled={isSubmitBtnDisabled}>
          저장하기
        </Button>
      </form>

      {(isSubmitPending || isSubmitSuccess) && (
        <div className="absolute inset-0 w-full h-full bg-white/40 grid place-items-center">
          <LoadingSpinner
            size={40}
            open
            success={isSubmitSuccess}
            onClose={() => {
              onSubmitSuccess?.();
            }}
          />
        </div>
      )}
    </>
  );
};

export default EditProfileForm;
