"use client";

import { useCallback, useMemo } from "react";
import { addDays } from "@/src/shared/utils/calendar";
import { useToastStore } from "@/src/shared/toast/toastStore";
import { useConfirmStore } from "@/src/shared/confirm/confirmStore";
import Button from "@/src/shared/ui/Button";
import LoadingSpinner from "@/src/shared/ui/LoadingSpinner";
import VoteCalendar from "./VoteCalendar";
import useVoteDateForm from "./useVoteDateForm";

interface VoteDateFormProps {
  onSubmit: () => void;
  appointmentId: string;
  userId: number;
  isHost: boolean;
}

const VoteDateForm = ({
  onSubmit,
  appointmentId,
  userId,
  isHost,
}: VoteDateFormProps) => {
  const confirm = useConfirmStore((state) => state.confirm);
  const toast = useToastStore((state) => state.toast);

  const { status, onChange, submitForm, isSubmitPending, isSubmitSuccess } =
    useVoteDateForm({
      appointmentId,
      userId,
      isHost,
    });

  const onClickSubmitButton = useCallback(async () => {
    const result = await confirm({
      title: "저장하기",
      message: "투표를 저장하시겠습니까?",
    });

    if (!result) return;

    submitForm({
      onSubmitSuccess: () => {
        toast({ message: "투표가 완료됐어요." });
        onSubmit();
      },
      onSubmitError: () => {
        toast({
          message: "투표에 실패했습니다. 잠시 후 다시 시도해주세요.",
        });
      },
    });
  }, [confirm, submitForm, toast, onSubmit]);

  const showLoading = isSubmitPending || isSubmitSuccess;

  const tomorrow = useMemo(() => addDays(new Date(), 1), []);

  return (
    <>
      <VoteCalendar startDate={tomorrow} value={status} onChange={onChange} />
      <div className="w-full flex flex-col gap-4 px-16">
        <div className="flex flex-row gap-16">
          <div className="flex flex-row gap-4 items-center">
            <div className="w-16 h-16 rounded-full bg-primary-400" />
            <p className="typo-14-regular text-gray-500">선택</p>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <div className="w-16 h-16 rounded-full bg-gray-300" />
            <p className="typo-14-regular text-gray-500">애매</p>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <div className="w-16 h-16 rounded-full bg-white border border-gray-200" />
            <p className="typo-14-regular text-gray-500">선택 취소</p>
          </div>
        </div>
        <p className="typo-14-regular text-gray-500">
          날짜를 여러 번 터치해서 상태를 바꿀 수 있어요.
        </p>
      </div>
      <Button size="Medium" color="Primary" onClick={onClickSubmitButton}>
        저장하기
      </Button>

      {showLoading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/25 flex justify-center items-center">
          <LoadingSpinner size={25} open success={isSubmitSuccess} />
        </div>
      )}
    </>
  );
};

export default VoteDateForm;
