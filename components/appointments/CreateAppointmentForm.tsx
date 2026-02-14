"use client";

import { FormEvent } from "react";
import AddressInput from "../shared/AddressInput";
import Button from "../shared/Button";
import DateInput from "../shared/DateInput";
import FormField from "../shared/FormField";

const CreateAppointmentForm = () => {
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 약속 생성, 프로필 등록
  };

  return (
    <form className="flex flex-col gap-32" onSubmit={onSubmit}>
      <div className="flex flex-col gap-8">
        <FormField label="약속 이름" inputId="appointment-name" required>
          <div className="input-container">
            <input
              className="input typo-16-regular"
              id="appointment-name"
              name="appointment-name"
              type="text"
              maxLength={14}
              required
              placeholder="예: 노란고양이파"
            />
          </div>
        </FormField>

        <FormField
          label="투표 마감일"
          inputId="deadline"
          description="참여자들은 지정된 마감일까지 투표할 수 있어요."
          required
        >
          <DateInput
          // value={deadline}
          // onValueChange={(value) => setDeadline(value)}
          />
        </FormField>

        <FormField label="이름" inputId="nickname" required>
          <div className="input-container">
            <input
              className="input typo-16-regular"
              id="nickname"
              name="nickname"
              type="text"
              maxLength={14}
              required
              placeholder="예) 애옹이"
            />
          </div>
        </FormField>

        <FormField
          label="출발 장소"
          inputId="departure-location"
          description="장소 투표 결과가 같을 경우, 모두의 출발지에서 가까운 중간 지점을 추천해 드려요."
        >
          <AddressInput inputId="departure-location" />
        </FormField>
      </div>
      <Button size="Large" color="Primary">
        약속 정하러 가기
      </Button>
    </form>
  );
};

export default CreateAppointmentForm;
