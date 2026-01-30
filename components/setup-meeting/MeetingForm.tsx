"use client";

import { FormEvent, useCallback, useState } from "react";
import Button from "../shared/Button";
import FormField from "../shared/FormField";
import DateInput from "../shared/DateInput";
import useCreateMeeting from "@/hooks/useCreateMeeting";
import { useRouter } from "next/navigation";

const MeetingForm = () => {
  const router = useRouter();

  const [meetingName, setMeetingName] = useState<string>("");
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);

  const isButtonDisabled = useCallback(
    (meetingName: string, deadline: Date | undefined) => {
      return meetingName === "" || deadline === undefined;
    },
    [],
  );

  const { mutate, isPending } = useCreateMeeting();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (meetingName === "" || deadline === undefined) return;

    mutate(
      { meetingName, deadline },
      {
        onSuccess: ({ appointment }) => {
          // 약속 페이지로 이동
          router.push(`/meeting/${appointment.appointmentId}`);
        },
        onError: () => {
          // 에러 페이지로 전환?
          alert("약속 생성에 실패하였습니다. 잠시 후 다시 시도해주세요.");
        },
      },
    );
  };

  return (
    <section>
      <form className="flex flex-col gap-64" onSubmit={onSubmit}>
        <div className="flex flex-col gap-16">
          <FormField label="약속 이름" inputId="meeting-name">
            <div className="input-container">
              <input
                className="input typo-16-regular w-full"
                id="meeting-name"
                name="meeting-name"
                type="text"
                maxLength={14}
                required
                placeholder="예: 배드민턴 모임 회식, 어쩌고"
                value={meetingName}
                onChange={(e) => setMeetingName(e.target.value)}
              />
            </div>
          </FormField>

          <FormField
            label="투표 마감일"
            inputId="deadline"
            description="참여자들은 지정된 마감일까지 투표할 수 있어요."
          >
            <DateInput
              value={deadline}
              onValueChange={(value) => setDeadline(value)}
            />
          </FormField>
        </div>

        <Button
          size="Large"
          color="Primary"
          className="w-full"
          disabled={isButtonDisabled(meetingName, deadline)}
        >
          약속 정하러 가기
        </Button>
      </form>
    </section>
  );
};

export default MeetingForm;
