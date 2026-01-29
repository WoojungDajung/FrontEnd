import Script from "next/script";
import CloseIcon from "../shared/icons/CloseIcon";
import KakaoIcon from "../shared/icons/KakaoIcon";
import Modal from "../shared/Modal";
import CopyIcon from "./icons/CopyIcon";
import MoreIcon from "./icons/MoreIcon";
import {
  initiateKakao,
  shareMeetingOnKakaoTalk,
} from "@/lib/kakao-share/utils";

interface ShareModalProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const ShareModal = ({ open, setOpen }: ShareModalProps) => {
  //TODO: 유효 링크로 변경
  const link = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/1`;

  const showMoreShare = () => {
    navigator.share({ url: link });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(link);
  };

  const shareOnKakaoTalk = () => {
    shareMeetingOnKakaoTalk("1", "스터디밥먹으러");
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
        open={open}
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
                <div className="flex flex-col gap-8 items-center">
                  <button
                    className="button w-56 h-56 bg-[#FEE500] rounded-full"
                    onClick={shareOnKakaoTalk}
                  >
                    <KakaoIcon width={24} height={24} />
                  </button>
                  <p className="typo-12-regular text-gray-500">카카오톡</p>
                </div>
                <div className="flex flex-col gap-8 items-center">
                  <button
                    className="button w-56 h-56 bg-gray-100 rounded-full"
                    onClick={showMoreShare}
                  >
                    <MoreIcon width={24} height={24} />
                  </button>
                  <p className="typo-12-regular text-gray-500">더보기</p>
                </div>
                <div className="flex flex-col gap-8 items-center">
                  <button
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
