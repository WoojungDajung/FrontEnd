import { FormEvent, useState } from "react";
import BottomDrawer from "../shared/BottomDrawer";
import Button from "../shared/Button";
import DateInput from "../shared/DateInput";
import DefaultDrawerLayout from "../shared/DefaultDrawerLayout";
import FormField from "../shared/FormField";
import useEditAppointment from "@/hooks/useEditAppointment";
import { useQueryClient } from "@tanstack/react-query";

interface EditMeetingDrawerProps {
  appointmentId: string;
  initialName: string;
  initialDueDate: Date;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const EditMeetingDrawer = ({
  appointmentId,
  initialName,
  initialDueDate,
  open,
  setOpen,
}: EditMeetingDrawerProps) => {
  const [name, setName] = useState<string>(initialName);
  const [dueDate, setDueDate] = useState<Date | undefined>(initialDueDate);

  const queryClient = useQueryClient();
  const { mutate } = useEditAppointment({ appointmentId });

  const onSubmit = (e: FormEvent<HTMLFormElement>, closeModal: () => void) => {
    e.preventDefault();
    
    if (name === "" || dueDate === undefined) return;

    mutate(
      { appointmentName: name, appointmentDueDate: dueDate },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({
            queryKey: ["appointment", appointmentId],
          });
          closeModal();
        },
        onError: (error) => {
          alert(
            `약속 정보 수정에 실패하였습니다. 잠시후 다시 시도해 주세요. (${error.message})`,
          );
        },
      },
    );
  };

  return (
    <BottomDrawer open={open} onOpenChange={setOpen}>
      {({ close }) => (
        <DefaultDrawerLayout
          title="약속 정보"
          secondaryAction={{ label: "약속 없애기", onClick: () => {} }}
          close={close}
        >
          <form
            className="flex flex-col gap-40"
            onSubmit={(e) => onSubmit(e, close)}
          >
            <div className="mt-16 flex flex-col gap-16">
              <FormField label="약속 이름" required inputId="appointment-name">
                <div className="input-container">
                  <input
                    className="input"
                    id="appointment-name"
                    name="appointment-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </FormField>
              <FormField
                label="투표 마감일"
                inputId="appointment-dueDate"
                description="참여자들은 지정된 마감일 자정까지 투표할 수 있어요."
              >
                <DateInput
                  id="appointment-dueDate"
                  name="appointment-dueDate"
                  value={dueDate}
                  onValueChange={(value) => setDueDate(value)}
                />
              </FormField>
            </div>
            <Button
              className="h-56"
              size="Large"
              disabled={name === "" || dueDate === undefined}
            >
              등록하기
            </Button>
          </form>
        </DefaultDrawerLayout>
      )}
    </BottomDrawer>
  );
};

export default EditMeetingDrawer;
