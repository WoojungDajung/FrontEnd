"use client";

import AddressInput from "../shared/AddressInput";
import Button from "../shared/Button";
import DateInput from "../shared/DateInput";
import FormField from "../shared/FormField";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../shared/LoadingSpinner";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";
import { Place } from "@/types/shared";
import useCreateAppointment from "@/hooks/useCreateAppointment";
import { sendGTM } from "@/lib/google-tag-manager";
import { dateToString } from "@/utils/calendar";
import { useToastStore } from "@/store/toastStore";

interface FormValues {
  appointmentName: string;
  deadline: Date;
  nickName: string;
  startingPlace?: Place;
}

const CreateAppointmentForm = () => {
  const router = useRouter();
  const toast = useToastStore((state) => state.toast);

  const {
    register,
    control,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm<FormValues>({ mode: "onChange" });

  /* 약속방 생성 및 프로필 등록 */
  const { mutate, isPending, reset } = useCreateAppointment();

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const { appointmentName, deadline, nickName, startingPlace } = data;
    mutate(
      { appointmentName, deadline, nickName, startingPlace },
      {
        onSuccess: (appointmentId) => {
          // 약속 페이지로 이동
          sendGTM({
            event: "create_appointment",
            appointment_id: appointmentId,
            deadline_time: dateToString(deadline),
          });

          router.push(`/appointment/${appointmentId}`);
        },
        onError: () => {
          toast({ message: "생성에 실패했어요. 잠시 후 다시 시도해주세요." });
          reset();
        },
      },
    );
  };

  return (
    <form className="flex flex-col gap-32" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-8">
        <FormField label="약속 이름" inputId="appointmentName" required>
          <div
            className={cn(
              "input-container",
              errors.appointmentName && "input-container--error",
            )}
          >
            <input
              className="input typo-16-regular w-full"
              placeholder="예) 노란고양이파"
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
          description="참여자들은 지정된 마감일까지 투표할 수 있어요."
          required
        >
          <Controller
            name="deadline"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <DateInput value={field.value} onValueChange={field.onChange} />
            )}
          />
        </FormField>

        <FormField label="이름" inputId="nickName" required>
          <div
            className={cn(
              "input-container",
              errors.nickName && "input-container--error",
            )}
          >
            <input
              className="input typo-16-regular w-full"
              {...register("nickName", { required: true, maxLength: 8 })}
              placeholder="예) 애옹이"
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
        id="btn_create_appointment"
        size="Large"
        color="Primary"
        type="submit"
        disabled={!isValid}
      >
        약속 정하러 가기
      </Button>

      {isPending &&
        createPortal(
          <div className="absolute w-dvw h-dvh grid place-items-center">
            <LoadingSpinner size={40} open />
          </div>,
          document.getElementById("popup")!,
        )}
    </form>
  );
};

export default CreateAppointmentForm;
