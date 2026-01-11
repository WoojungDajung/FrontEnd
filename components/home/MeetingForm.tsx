"use client";

import { useCallback, useState } from "react";
import CalendarIcon from "./CalendarIcon";
import DatePicker from "./DatePicker";

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

const MeetingForm = () => {
  const [meetingName, setMeetingName] = useState<string>("");
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [datePickerOpened, setDatePickerOpened] = useState(false);

  const onDatePickerSelected = useCallback((selected: Date | undefined) => {
    setDeadline(selected);
    setDatePickerOpened(false);
  }, []);

  const isButtonDisabled = useCallback(
    (meetingName: string, deadline: Date | undefined) => {
      return meetingName === "" || deadline === undefined;
    },
    []
  );

  const onSubmit = () => {
    // TODO: meetingName, deadline으로 약속 생성
  };

  return (
    <section>
      <form className="flex flex-col gap-64" onSubmit={onSubmit}>
        <div className="flex flex-col gap-16">
          <div className="flex flex-col gap-8">
            <label
              className="input-label typo-14-medium ml-8"
              htmlFor="meeting-name"
            >
              약속 이름
            </label>
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
          </div>

          <div className="flex flex-col gap-8">
            <label
              className="input-label typo-14-medium ml-8"
              htmlFor="deadline"
            >
              투표 마감일
            </label>
            <div
              className="input-container flex flex-row gap-8 relative"
              data-focus={datePickerOpened}
            >
              <CalendarIcon />
              <div
                onClick={() => setDatePickerOpened((prev) => !prev)}
                className="w-full typo-16-regular cursor-pointer"
              >
                {deadline ? (
                  <p className="input">{formatDate(deadline)}</p>
                ) : (
                  <p className="input-placeholder">연도-월-일</p>
                )}
              </div>
              <input
                type="hidden"
                id="deadline"
                name="deadline"
                value={deadline ? formatDate(deadline) : ""}
                required
              />

              {datePickerOpened && (
                <div className="absolute bottom-full left-0">
                  <DatePicker
                    selected={deadline}
                    onSelect={onDatePickerSelected}
                  />
                </div>
              )}
            </div>
            <p className="typo-14-regular text-gray-500 ml-8">
              참여자들은 지정된 마감일까지 투표할 수 있어요.
            </p>
          </div>
        </div>

        <button
          className="button typo-18-semibold w-full h-64"
          type="submit"
          disabled={isButtonDisabled(meetingName, deadline)}
        >
          약속 정하러 가기
        </button>
      </form>
    </section>
  );
};

export default MeetingForm;
