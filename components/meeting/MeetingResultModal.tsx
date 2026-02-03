import { useMemo, useState } from "react";
import CalendarIcon from "../shared/icons/CalendarIcon";
import CloseIcon from "../shared/icons/CloseIcon";
import Modal from "../shared/Modal";
import ThumbUpIcon from "./icons/ThumbUpIcon";
import { WEEKDAYS_KO } from "@/utils/calendar";
import DownChevronIcon from "./icons/DownChevronIcon";
import UpChevronIcon from "./icons/UpChevronIcon";
import ShineIcon from "./icons/ShineIcon";
import PlaceIcon from "./icons/PlaceIcon";
import CopyIcon from "./icons/CopyIcon";
import KakaoIcon from "../shared/icons/KakaoIcon";
import MoreIcon from "./icons/MoreIcon";
import Script from "next/script";
import {
  initiateKakao,
  MESSAGE_TEMPLATE_ID,
  shareMeetingOnKakaoTalk,
} from "@/lib/kakao-share/utils";
import { Appointment } from "@/types/apiResponse";

interface MeetingResultModalProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  appointment: Appointment;
}

const MeetingResultModal = ({
  open,
  setOpen,
  appointment,
}: MeetingResultModalProps) => {
  // TODO: 결과 API 연결
  const date: Date = useMemo(() => new Date(), []);
  const place = useMemo(() => {
    return {
      name: "만리재 비스트로",
      address: "서울특별시 중구 만리재로 201",
    };
  }, []);
  const isDateTie = true; // 날짜 결과 동률 여부
  const isPlaceTie = false; // 장소 결과 동률 여부
  // 결과 선정 이유 표시
  const [showDateReason, setShowDateReason] = useState(false);
  const [showPlaceReason, setShowPlaceReason] = useState(false);

  /* 결과 공유 */
  const link = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${appointment.appointmentId}`;

  const showMoreShare = () => {
    navigator.share({ url: link });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(link);
  };

  const shareOnKakaoTalk = () => {
    shareMeetingOnKakaoTalk(
      appointment.appointmentId,
      appointment.appointmentName,
      MESSAGE_TEMPLATE_ID.SHARE_RESULT,
    );
  };

  return (
    <Modal
      open={open}
      onOpenChange={(open) => setOpen?.(open)}
      className="pt-8 pb-32 flex flex-col gap-32"
    >
      {({ close }) => (
        <>
          <div className="w-full px-8 flex justify-end">
            <button className="button" onClick={close}>
              <CloseIcon />
            </button>
          </div>
          {/* 결과 */}
          <section className="flex flex-col gap-24">
            <div className="flex flex-col gap-24 items-center">
              <div className="flex flex-col gap-8 items-center">
                <div className="w-fit typo-12-regular bg-primary-25 text-primary-400 px-8 py-4 rounded-[100px]">
                  ✨ 만나는 날짜, 우리 정했어요! ✨
                </div>
                {isDateTie || isPlaceTie ? (
                  <>
                    <p className="typo-18-semibold text-gray-800 text-center">
                      일정과 장소를 함께 고려해
                      <br />
                      가장 잘 맞는 조합을 추천해요!
                    </p>
                    <p className="typo-12-regular text-gray-500 text-center">
                      투표수가 같을 때,
                      <br />
                      모두가 편하게 모일 수 있는 선택지를 추천해드려요.
                    </p>
                  </>
                ) : (
                  <p className="typo-18-semibold text-gray-800 text-center">
                    정해진 일정과 장소를 확인해보세요!
                  </p>
                )}
              </div>
            </div>

            <div className="px-24 flex flex-col gap-16">
              {/* 일정 */}
              <section className="px-16 py-24 rounded-[16px] bg-gray-50 flex flex-col gap-16">
                <div className="flex gap-4 items-center">
                  <CalendarIcon
                    width={16}
                    height={16}
                    color="var(--color-gray-400)"
                  />
                  <p className="typo-14-medium text-gray-400">일정</p>
                </div>
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center">
                      {isDateTie ? (
                        <>
                          <ShineIcon
                            width={16}
                            height={16}
                            color="var(--color-primary-400)"
                          />
                          <p className="typo-12-regular text-primary-400">
                            만날우정 추천 일정
                          </p>
                        </>
                      ) : (
                        <>
                          <ThumbUpIcon
                            width={16}
                            height={16}
                            color="var(--color-primary-300)"
                          />
                          <p className="typo-12-regular text-primary-400">
                            친구들이 가장 많이 선택한 일정
                          </p>
                        </>
                      )}
                    </div>
                    <p className="typo-16-semibold text-gray-800">{`${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS_KO[date.getDay()]}요일`}</p>
                  </div>
                  {/* 추천 이유 */}
                  {isDateTie && (
                    <div className="flex flex-col gap-8">
                      <div className="flex justify-between items-center">
                        <p className="typo-14-regular text-gray-400">
                          추천 이유 보기
                        </p>
                        {showDateReason ? (
                          <button
                            onClick={() => setShowDateReason(false)}
                            className="button"
                          >
                            <UpChevronIcon
                              width={20}
                              height={20}
                              color="var(--color-gray-400)"
                            />
                          </button>
                        ) : (
                          <button
                            onClick={() => setShowDateReason(true)}
                            className="button"
                          >
                            <DownChevronIcon
                              width={20}
                              height={20}
                              color="var(--color-gray-400)"
                            />
                          </button>
                        )}
                      </div>
                      {/* 추천 이유 내용 */}
                      {showDateReason && (
                        <div className="flex flex-col gap-8">
                          {/* 이유 */}
                          <ul className="list-disc list-inside typo-14-regular text-gray-500">
                            <li>모두가 가장 선호하는 요일이에요.</li>
                            <li>후보 장소들이 운영하는 날이에요.</li>
                          </ul>
                          {/* 선택한 사람 */}
                          <div className="flex flex-col gap-8">
                            <div className="flex pl-4 gap-4">
                              <p className="typo-14-regular text-gray-500">
                                선택한 사람
                              </p>
                              <p className="typo-14-regular">
                                <span className="text-primary-400">{`${4}`}</span>
                                <span className="text-gray-500">{`/${5}`}</span>
                              </p>
                            </div>
                            <div className="flex gap-4 flex-wrap">
                              <div className="px-8 py-4 rounded-[100px] bg-gray-100 text-gray-800 typo-12-regular">
                                우정
                              </div>
                              <div className="px-8 py-4 rounded-[100px] bg-gray-100 text-gray-800 typo-12-regular">
                                순대
                              </div>
                              <div className="px-8 py-4 rounded-[100px] bg-gray-100 text-gray-800 typo-12-regular">
                                민지
                              </div>
                              <div className="px-8 py-4 rounded-[100px] bg-gray-100 text-gray-800 typo-12-regular">
                                김유정
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
              {/* 장소 */}
              <section className="px-16 py-24 rounded-[16px] bg-gray-50 flex flex-col gap-16">
                <div className="flex gap-4 items-center">
                  <PlaceIcon
                    width={16}
                    height={16}
                    color="var(--color-gray-400)"
                  />
                  <p className="typo-14-medium text-gray-400">장소</p>
                </div>
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center">
                      {isPlaceTie ? (
                        <>
                          <ShineIcon
                            width={16}
                            height={16}
                            color="var(--color-primary-400)"
                          />
                          <p className="typo-12-regular text-primary-400">
                            만날우정 추천 장소
                          </p>
                        </>
                      ) : (
                        <>
                          <ThumbUpIcon
                            width={16}
                            height={16}
                            color="var(--color-primary-300)"
                          />
                          <p className="typo-12-regular text-primary-400">
                            친구들이 가장 많이 선택한 장소
                          </p>
                        </>
                      )}
                    </div>
                    <div>
                      <p className="typo-16-semibold text-gray-800">
                        {place.name}
                      </p>
                      <div className="flex gap-4 items-center">
                        <p className="typo-14-regular text-gray-500">
                          {place.address}
                        </p>
                        <button
                          className="button"
                          onClick={() =>
                            navigator.clipboard.writeText(place.address)
                          }
                        >
                          <CopyIcon
                            width={24}
                            height={24}
                            color="var(--color-gray-500)"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* 추천 이유 */}
                  {isPlaceTie && (
                    <div className="flex flex-col gap-8">
                      <div className="flex justify-between items-center">
                        <p className="typo-14-regular text-gray-400">
                          추천 이유 보기
                        </p>
                        {showPlaceReason ? (
                          <button
                            onClick={() => setShowPlaceReason(false)}
                            className="button"
                          >
                            <UpChevronIcon
                              width={20}
                              height={20}
                              color="var(--color-gray-400)"
                            />
                          </button>
                        ) : (
                          <button
                            onClick={() => setShowPlaceReason(true)}
                            className="button"
                          >
                            <DownChevronIcon
                              width={20}
                              height={20}
                              color="var(--color-gray-400)"
                            />
                          </button>
                        )}
                      </div>
                      {/* 추천 이유 내용 */}
                      {showPlaceReason && (
                        <div className="flex flex-col gap-8">
                          {/* 이유 */}
                          <ul className="list-disc list-inside typo-14-regular text-gray-500">
                            <li>운영 중인 후보 중 인기가 가장 많아요.</li>
                            <li>모두의 위치에서 이동 부담이 적어요.</li>
                          </ul>
                          {/* 선택한 사람 */}
                          <div className="flex flex-col gap-8">
                            <div className="flex pl-4 gap-4">
                              <p className="typo-14-regular text-gray-500">
                                선택한 사람
                              </p>
                              <p className="typo-14-regular">
                                <span className="text-primary-400">{`${3}`}</span>
                                <span className="text-gray-500">{`/${5}`}</span>
                              </p>
                            </div>
                            <div className="flex gap-4 flex-wrap">
                              <div className="px-8 py-4 rounded-[100px] bg-gray-100 text-gray-800 typo-12-regular">
                                우정
                              </div>
                              <div className="px-8 py-4 rounded-[100px] bg-gray-100 text-gray-800 typo-12-regular">
                                순대
                              </div>
                              <div className="px-8 py-4 rounded-[100px] bg-gray-100 text-gray-800 typo-12-regular">
                                김유정
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </section>

          {/* 공유 */}
          <section className="flex justify-center gap-24">
            <Script
              src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.9/kakao.min.js"
              integrity="sha384-JpLApTkB8lPskhVMhT+m5Ln8aHlnS0bsIexhaak0jOhAkMYedQoVghPfSpjNi9K1"
              crossOrigin="anonymous"
              onLoad={initiateKakao}
            />
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
          </section>
        </>
      )}
    </Modal>
  );
};

export default MeetingResultModal;
