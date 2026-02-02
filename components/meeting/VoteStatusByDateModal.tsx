import useDateVoteStatusByYMD from "@/hooks/useDateVoteStatusByYMD";
import CloseIcon from "../shared/icons/CloseIcon";
import Modal from "../shared/Modal";
import CheckIcon from "./icons/CheckIcon";
import ClockIcon from "./icons/ClocktIcon";

interface VoteStatusByDateModalProps {
  date: Date;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  appointmentId: string;
}

const VoteStatusByDateModal = ({
  date,
  open,
  setOpen,
  appointmentId,
}: VoteStatusByDateModalProps) => {
  const { data } = useDateVoteStatusByYMD(appointmentId, date, open ?? false);

  if (data === undefined) return <></>;

  return (
    <Modal
      className="py-16"
      open={open}
      onOpenChange={(open) => setOpen?.(open)}
    >
      {({ close }) => (
        <div className="flex flex-col gap-16">
          <div className="w-full flex justify-center items-center relative">
            <p className="typo-18-semibold text-gray-800">{`${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`}</p>
            <button className="button absolute right-16" onClick={close}>
              <CloseIcon />
            </button>
          </div>
          <div className="flex flex-col gap-16 px-16">
            {/* 투표 완료 */}
            <div className="flex flex-col gap-8">
              <div className="flex gap-8">
                <div className="rounded-full bg-primary-25 w-24 h-24 flex justify-center items-center">
                  <CheckIcon
                    width={24}
                    height={24}
                    color="var(--color-primary-400)"
                  />
                </div>
                <p className="typo-14-regular text-gray-800">{`가능해요 (${data.possibleCount}명)`}</p>
              </div>
              <div className="flex gap-4">
                {data.possibleUserList.map((user) => (
                  <div
                    key={user.id}
                    className="px-8 py-4 rounded-[100px] bg-primary-25"
                  >
                    <p className="text-primary-500 typo-12-regular">
                      {user.nickName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            {/* 투표 대기 */}
            <div className="flex flex-col gap-8">
              <div className="flex gap-8">
                <div className="rounded-full bg-gray-100 w-24 h-24 flex justify-center items-center">
                  <ClockIcon
                    width={24}
                    height={24}
                    color="var(--color-gray-400)"
                  />
                </div>
                <p className="typo-14-regular text-gray-800">{`애매해요 (${data.ambCount}명)`}</p>
              </div>
              <div className="flex gap-4">
                {data.ambUserList.map((user) => (
                  <div
                    key={user.id}
                    className="px-8 py-4 rounded-[100px] bg-gray-100"
                  >
                    <p className="text-gray-500 typo-12-regular">
                      {user.nickName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default VoteStatusByDateModal;
