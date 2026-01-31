import { useState } from "react";
import BottomDrawer from "../shared/BottomDrawer";
import Button from "../shared/Button";
import DefaultDrawerLayout from "../shared/DefaultDrawerLayout";
import FormField from "../shared/FormField";
import { MemberProfile } from "@/types/apiResponse";

interface EditProfileDrawerProps {
  initialProfile?: MemberProfile;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const EditProfileDrawer = ({
  initialProfile,
  open,
  setOpen,
}: EditProfileDrawerProps) => {
  const [nickName, setNickName] = useState(initialProfile?.memberNickName);

  const alreadyJoined = initialProfile !== undefined;

  const onClickButton = () => {
    if (alreadyJoined) {
      // 프로필 수정
    } else {
      // 약속 방 참여(join)
    }
  };

  return (
    <BottomDrawer open={open} onOpenChange={setOpen}>
      {({ close }) => (
        <DefaultDrawerLayout
          title="내 정보"
          secondaryAction={
            alreadyJoined
              ? { label: "약속 나가기", onClick: () => {} }
              : undefined
          }
          close={close}
        >
          <div className="flex flex-col gap-40">
            <div className="mt-16 flex flex-col gap-16">
              <FormField label="이름" required inputId="name">
                <div className="input-container">
                  <input
                    className="input"
                    id="name"
                    name="name"
                    type="text"
                    value={nickName}
                    onChange={(event) => setNickName(event.target.value)}
                  />
                </div>
              </FormField>
              <FormField
                label="출발 장소"
                inputId="departure-location"
                description="장소 투표 결과가 같을 경우, 모두의 출발지에서 가까운 중간 지점을 추천해 드려요."
              >
                <div className="input-container">
                  {/* TODO: 장소 선택 인풋 변경 */}
                  <input
                    className="input"
                    id="departure-location"
                    name="departure-location"
                    type="text"
                  />
                </div>
              </FormField>
            </div>
            <Button
              className="h-56"
              size="Large"
              onClick={onClickButton}
              disabled={nickName === "" || nickName === undefined}
            >
              저장하기
            </Button>
          </div>
        </DefaultDrawerLayout>
      )}
    </BottomDrawer>
  );
};

export default EditProfileDrawer;
