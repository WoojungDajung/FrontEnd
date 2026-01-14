import { useState } from "react";
import BottomDrawer from "../shared/BottomDrawer";
import Button from "../shared/Button";
import DateInput from "../shared/DateInput";
import DefaultDrawerLayout from "../shared/DefaultDrawerLayout";
import FormField from "../shared/FormField";

interface EditMeetingDrawerProps {
  initialMeetingName: string;
  initialDeadline: Date;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const EditMeetingDrawer = ({
  initialMeetingName,
  initialDeadline,
  open,
  setOpen,
}: EditMeetingDrawerProps) => {
  const [meetingName, setMeetingName] = useState<string>(initialMeetingName);
  const [deadline, setDeadline] = useState<Date | undefined>(initialDeadline);

  const editMeeting = () => {
    // TODO: 약속 정보 등록
  };

  return (
    <BottomDrawer open={open} onOpenChange={setOpen}>
      {({ close }) => (
        <DefaultDrawerLayout
          title="약속 정보"
          secondaryAction={{ label: "약속 없애기", onClick: () => {} }}
          close={close}
        >
          <div className="flex flex-col gap-40">
            <div className="mt-16 flex flex-col gap-16">
              <FormField label="약속 이름" required inputId="meeting-name">
                <div className="input-container">
                  <input
                    className="input"
                    id="meeting-name"
                    name="meeting-name"
                    type="text"
                    value={meetingName}
                    onChange={(e) => setMeetingName(e.target.value)}
                  />
                </div>
              </FormField>
              <FormField
                label="투표 마감일"
                inputId="deadline"
                description="참여자들은 지정된 마감일 자정까지 투표할 수 있어요."
              >
                <DateInput
                  value={deadline}
                  onValueChange={(value) => setDeadline(value)}
                />
              </FormField>
            </div>
            <Button className="h-56 rounded-[16px]" onClick={editMeeting}>
              등록하기
            </Button>
          </div>
        </DefaultDrawerLayout>
      )}
    </BottomDrawer>
  );
};

export default EditMeetingDrawer;
