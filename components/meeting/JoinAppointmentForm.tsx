"use client";

import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Button from "../shared/Button";
import { Place } from "@/types/shared";
import FormField from "../shared/FormField";
import AddressInput from "../shared/AddressInput";
import { cn } from "@/utils/cn";

interface JoinAppointmentFormProps {
  appointmentId: string;
}

interface FormValues {
  nickName: string;
  departureLocation?: Place;
}

const JoinAppointmentForm = ({ appointmentId }: JoinAppointmentFormProps) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm<FormValues>({ mode: "onChange" });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const { nickName, departureLocation } = data;
    // join
  };

  return (
    <form className="flex flex-col gap-40" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-16">
        <FormField label="이름" inputId="nickName" required>
          <div
            className={cn(
              "input-container",
              errors.nickName && "input-container--error",
            )}
          >
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

      <Button
        size="Large"
        color="Primary"
        className="h-56"
        type="submit"
        disabled={!isValid}
      >
        약속 함께하기
      </Button>
    </form>
  );
};

export default JoinAppointmentForm;
