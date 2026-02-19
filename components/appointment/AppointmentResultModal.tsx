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
  shareAppointmentOnKakaoTalk,
} from "@/lib/kakao/kakao-share";
import { Appointment, ConfirmedResult } from "@/types/apiResponse";
import dayjs from "dayjs";
import { useToast } from "@/context/ToastContext";

interface AppointmentResultModalProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  appointment: Appointment;
  appointmentUserCount: number;
  result: ConfirmedResult;
}

const AppointmentResultModal = ({
  open,
  setOpen,
  appointment,
  appointmentUserCount,
  result,
}: AppointmentResultModalProps) => {
  const { toast } = useToast();

  const confirmedDateStr = useMemo(() => {
    const date = dayjs(result.confirmedDate).toDate();
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS_KO[date.getDay()]}요일`;
  }, [result]);

  const isDateRecommended = result.dateSelectedReasonList.length > 0; // 날짜 결과 동률 여부
  const isPlaceRecommended = result.placeSelectedReasonList.length > 0; // 장소 결과 동률 여부
  // 결과 선정 이유 표시
  const [showDateReason, setShowDateReason] = useState(false);
  const [showPlaceReason, setShowPlaceReason] = useState(false);

  /* 결과 공유 */
  const link = `${process.env.NEXT_PUBLIC_BASE_URL}/appointment/${appointment.appointmentId}`;

  const showMoreShare = () => {
    navigator.share({ url: link });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(link).then(() => {
      toast({
        message: "복사가 완료됐어요.",
      });
    });
  };

  const shareOnKakaoTalk = () => {
    shareAppointmentOnKakaoTalk(
      appointment.appointmentId,
      appointment.appointmentName,
      MESSAGE_TEMPLATE_ID.SHARE_RESULT,
    );
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(result.confirmedPlaceAddress).then(() => {
      toast({
        message: "복사가 완료됐어요.",
      });
    });
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
                {isDateRecommended || isPlaceRecommended ? (
                  <>
                    <p className="typo-18-semibold text-gray-800 text-center">
                      투표 결과가 동일해
                      <br />
                      가장 잘 맞는 약속 조합을 추천해요!
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
                      {isDateRecommended ? (
                        <>
                          <ShineIcon
                            width={16}
                            height={16}
                            color="var(--color-primary-400)"
                          />
                          <p className="typo-14-regular text-primary-400">
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
                          <p className="typo-14-regular text-primary-400">
                            친구들이 가장 많이 선택한 일정
                          </p>
                        </>
                      )}
                    </div>
                    <p className="typo-16-semibold text-gray-800">
                      {confirmedDateStr}
                    </p>
                  </div>
                  {/* 추천 이유 */}
                  {isDateRecommended && (
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
                            {result.dateSelectedReasonList.map((reason) => (
                              <li key={reason}>{reason}</li>
                            ))}
                          </ul>
                          {/* 선택한 사람 */}
                          <div className="flex flex-col gap-8">
                            <div className="flex pl-4 gap-4">
                              <p className="typo-14-regular text-gray-500">
                                선택한 사람
                              </p>
                              <p className="typo-14-regular">
                                <span className="text-primary-400">{`${result.dateVotedList.length}`}</span>
                                <span className="text-gray-500">{`/${appointmentUserCount}`}</span>
                              </p>
                            </div>
                            <div className="flex gap-4 flex-wrap">
                              {result.dateVotedList.map((member) => (
                                <div
                                  key={member}
                                  className="px-8 py-4 rounded-[100px] bg-gray-100 text-gray-800 typo-12-regular"
                                >
                                  {member}
                                </div>
                              ))}
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
                      {isPlaceRecommended ? (
                        <>
                          <ShineIcon
                            width={16}
                            height={16}
                            color="var(--color-primary-400)"
                          />
                          <p className="typo-14-regular text-primary-400">
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
                          <p className="typo-14-regular text-primary-400">
                            친구들이 가장 많이 선택한 장소
                          </p>
                        </>
                      )}
                    </div>
                    <div>
                      <p className="typo-16-semibold text-gray-800">
                        {result.confirmedPlaceName}
                      </p>
                      <div className="flex gap-4 items-center">
                        <p className="typo-14-regular text-gray-500">
                          {result.confirmedPlaceAddress}
                        </p>
                        <button className="button" onClick={copyAddress}>
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
                  {isPlaceRecommended && (
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
                            {result.placeSelectedReasonList.map((reason) => (
                              <li key={reason}>{reason}</li>
                            ))}
                          </ul>
                          {/* 선택한 사람 */}
                          <div className="flex flex-col gap-8">
                            <div className="flex pl-4 gap-4">
                              <p className="typo-14-regular text-gray-500">
                                선택한 사람
                              </p>
                              <p className="typo-14-regular">
                                <span className="text-primary-400">
                                  {result.placeVotedList.length}
                                </span>
                                <span className="text-gray-500">{`/${appointmentUserCount}`}</span>
                              </p>
                            </div>
                            <div className="flex gap-4 flex-wrap">
                              {result.placeVotedList.map((member) => (
                                <div
                                  key={member}
                                  className="px-8 py-4 rounded-[100px] bg-gray-100 text-gray-800 typo-12-regular"
                                >
                                  {member}
                                </div>
                              ))}
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

export default AppointmentResultModal;
