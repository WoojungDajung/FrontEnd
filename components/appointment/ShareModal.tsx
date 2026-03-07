import Script from "next/script";
import CloseIcon from "../shared/icons/CloseIcon";
import KakaoIcon from "../shared/icons/KakaoIcon";
import Modal from "../shared/Modal";
import CopyIcon from "./icons/CopyIcon";
import MoreIcon from "./icons/MoreIcon";
import {
  initiateKakao,
  MESSAGE_TEMPLATE_ID,
  shareAppointmentOnKakaoTalk,
} from "@/lib/kakao-share";
import { useToast } from "@/context/ToastContext";
import { sendGTM } from "@/lib/google-tag-manager";
import { ShareLinkEventData, ShareMethod } from "@/types/gtmEventData";

interface ShareModalProps {
  appointmentId: string;
  appointmentName: string;
  setOpen: (open: boolean) => void;
  isHost: boolean;
}

const ShareModal = ({
  appointmentId,
  appointmentName,
  setOpen,
  isHost,
}: ShareModalProps) => {
  const { toast } = useToast();

  const link = `${process.env.NEXT_PUBLIC_BASE_URL}/appointment/${appointmentId}`;

  const getGTMShareEventData = (method: ShareMethod): ShareLinkEventData => ({
    event: "share_link",
    appointment_id: appointmentId,
    user_role: isHost ? "host" : "guest",
    share_context: "invitation",
    share_method: method,
  });

  const showMoreShare = () => {
    navigator.share({ url: link }).then(() => {
      sendGTM(getGTMShareEventData("system_share"));
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(link).then(() => {
      toast({ message: "복사가 완료됐어요." });
      sendGTM(getGTMShareEventData("link_copy"));
    });
  };

  const shareOnKakaoTalk = () => {
    shareAppointmentOnKakaoTalk(
      appointmentId,
      appointmentName,
      MESSAGE_TEMPLATE_ID.INVITE,
    );
    sendGTM(getGTMShareEventData("kakao"));
  };

  return (
    <>
      <Script
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.9/kakao.min.js"
        integrity="sha384-JpLApTkB8lPskhVMhT+m5Ln8aHlnS0bsIexhaak0jOhAkMYedQoVghPfSpjNi9K1"
        crossOrigin="anonymous"
        onLoad={initiateKakao}
      />

      <Modal
        className="pt-8 pb-32"
        open
        onOpenChange={(open) => setOpen?.(open)}
      >
        {({ close }) => (
          <>
            <div className="w-full px-8 flex justify-end">
              <button className="button" onClick={close}>
                <CloseIcon />
              </button>
            </div>
            <div className="flex flex-col gap-24">
              <p className="typo-16-regular text-gray-800 text-center">
                만날우정, 함께할 친구를 불러보세요!
              </p>
              <div className="flex justify-center gap-24">
                {/* 카카오톡 공유 버튼 */}
                <div className="flex flex-col gap-8 items-center">
                  <button
                    id="btn_share_kakao"
                    className="button w-56 h-56 bg-[#FEE500] rounded-full"
                    onClick={shareOnKakaoTalk}
                  >
                    <KakaoIcon width={24} height={24} />
                  </button>
                  <p className="typo-12-regular text-gray-500">카카오톡</p>
                </div>
                {/* 더보기 버튼 */}
                <div className="flex flex-col gap-8 items-center">
                  <button
                    id="btn_share_sheet"
                    className="button w-56 h-56 bg-gray-100 rounded-full"
                    onClick={showMoreShare}
                  >
                    <MoreIcon width={24} height={24} />
                  </button>
                  <p className="typo-12-regular text-gray-500">더보기</p>
                </div>
                {/* URL 복사 버튼 */}
                <div className="flex flex-col gap-8 items-center">
                  <button
                    id="btn_copy_link"
                    className="button w-56 h-56 bg-gray-100 rounded-full"
                    onClick={copyLink}
                  >
                    <CopyIcon
                      width={40}
                      height={40}
                      color="var(--color-gray-500)"
                    />
                  </button>
                  <p className="typo-12-regular text-gray-500">링크 복사</p>
                </div>
              </div>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default ShareModal;
