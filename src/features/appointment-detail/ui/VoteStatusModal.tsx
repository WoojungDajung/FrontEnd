import Modal from "@/src/shared/ui/Modal";
import CheckIcon from "./icons/CheckIcon";
import ClockIcon from "./icons/ClocktIcon";
import CloseIcon from "@/src/shared/ui/icons/CloseIcon";

interface VoteStatusModalProps {
  votedMembers: string[];
  unvotedMembers: string[];
  setOpen: (open: boolean) => void;
}

const VoteStatusModal = ({
  votedMembers,
  unvotedMembers,
  setOpen,
}: VoteStatusModalProps) => {
  return (
    <Modal className="py-16" open onOpenChange={(open) => setOpen?.(open)}>
      {({ close }) => (
        <div className="flex flex-col gap-16">
          <div className="w-full flex justify-center items-center relative">
            <p className="typo-18-semibold text-gray-800">투표 현황</p>
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
                <p className="typo-14-regular text-gray-800">{`투표 완료 (${votedMembers.length}명)`}</p>
              </div>
              <div className="flex gap-4">
                {votedMembers.map((member) => (
                  <div
                    key={member}
                    className="px-8 py-4 rounded-[100px] bg-primary-25"
                  >
                    <p className="text-primary-500 typo-12-regular">{member}</p>
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
                <p className="typo-14-regular text-gray-800">{`투표 대기 (${unvotedMembers.length}명)`}</p>
              </div>
              <div className="flex gap-4">
                {unvotedMembers.map((member) => (
                  <div
                    key={member}
                    className="px-8 py-4 rounded-[100px] bg-gray-100"
                  >
                    <p className="text-gray-500 typo-12-regular">{member}</p>
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

export default VoteStatusModal;
