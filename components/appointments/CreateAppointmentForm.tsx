"use client";

import AddressInput from "../shared/AddressInput";
import Button from "../shared/Button";
import DateInput from "../shared/DateInput";
import FormField from "../shared/FormField";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../shared/LoadingSpinner";
import { createPortal } from "react-dom";
import { useMutation } from "@tanstack/react-query";
import { dateToString } from "@/utils/calendar";
import { createAppointment } from "@/api/appointment";
import { registerMemberProfile } from "@/api/member";

interface FormValues {
  appointmentName: string;
  deadline: Date;
  nickName: string;
  departureLocation?: Place;
}

type Place = {
  address: string;
  startingPlace: string;
  latitude: string;
  longitude: string;
};

const CreateAppointmentForm = () => {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<FormValues>();

  /* 약속방 생성 및 프로필 등록 */
  const { mutate, isPending, reset } = useMutation({
    mutationFn: async ({
      appointmentName,
      deadline,
      nickName,
      departureLocation,
    }: {
      appointmentName: string;
      deadline: Date;
      nickName: string;
      departureLocation?: Place;
    }) => {
      // TODO: 약속 생성과 프로필 등록 함께 처리하는 API 개발되면 수정하기 
      const { appointment } = await createAppointment(
        appointmentName,
        dateToString(deadline),
      );
      const profile = await registerMemberProfile(
        appointment.appointmentId,
        nickName,
        departureLocation,
      );
      return appointment.appointmentId;
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const { appointmentName, deadline, nickName, departureLocation } = data;
    mutate(
      { appointmentName, deadline, nickName, departureLocation },
      {
        onSuccess: (appointmentId) => {
          // 약속 페이지로 이동
          router.push(`/meeting/${appointmentId}`);
        },
        onError: () => {
          alert("약속 생성에 실패하였습니다. 잠시 후 다시 시도해주세요.");
          reset();
        },
      },
    );
  };

  return (
    <form className="flex flex-col gap-32" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-8">
        <FormField label="약속 이름" inputId="appointmentName" required>
          <div className="input-container">
            <input
              className="input typo-16-regular"
              placeholder="예: 노란고양이파"
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
          <div className="input-container">
            <input
              className="input typo-16-regular"
              {...register("nickName", { required: true, maxLength: 14 })}
              placeholder="예) 애옹이"
            />
          </div>
        </FormField>

        <FormField
          label="출발 장소"
          inputId="departureLocation"
          description="장소 투표 결과가 같을 경우, 모두의 출발지에서 가까운 중간 지점을 추천해 드려요."
        >
          <Controller
            name="departureLocation"
            control={control}
            render={({ field }) => (
              <AddressInput
                inputId="departureLocation"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </FormField>
      </div>
      <Button size="Large" color="Primary" type="submit" disabled={!isValid}>
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
