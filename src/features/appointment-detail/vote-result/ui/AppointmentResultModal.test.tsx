import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils/render";
import AppointmentResultModal from "./AppointmentResultModal";
import { Appointment, ConfirmedResult } from "@/src/entities/appointment/types";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

// next/script: JSDOM에서 외부 스크립트 로딩 불필요
jest.mock("next/script", () => ({
  __esModule: true,
  default: () => null,
}));

// Modal: createPortal 없이 children을 직접 렌더링하는 mock
jest.mock("@/src/shared/ui/Modal", () => ({
  __esModule: true,
  default: ({
    children,
    onOpenChange,
  }: {
    children: (api: { close: () => void }) => React.ReactNode;
    onOpenChange?: (open: boolean) => void;
  }) => {
    const close = () => onOpenChange?.(false);
    return <div>{children({ close })}</div>;
  },
}));

// 기능과 무관한 장식 아이콘들
jest.mock("@/src/shared/ui/icons/CalendarIcon", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("@/src/shared/ui/icons/PlaceIcon", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("@/src/shared/ui/icons/KakaoIcon", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("../../ui/icons/CopyIcon", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("../../ui/icons/MoreIcon", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("./icons/ShineIcon", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("./icons/ThumbUpIcon", () => ({
  __esModule: true,
  default: () => null,
}));

const mockShareAppointmentOnKakaoTalk = jest.fn();
jest.mock("@/src/shared/lib/kakao-share", () => ({
  initiateKakao: jest.fn(),
  MESSAGE_TEMPLATE_ID: { INVITE: 128317, SHARE_RESULT: 128954 },
  shareAppointmentOnKakaoTalk: (...args: unknown[]) =>
    mockShareAppointmentOnKakaoTalk(...args),
}));

const mockSendGTM = jest.fn();
jest.mock("@/src/shared/lib/googleTagManager/sendGTM", () => ({
  sendGTM: (...args: unknown[]) => mockSendGTM(...args),
}));

const mockToast = jest.fn();
jest.mock("@/src/shared/toast/toastStore", () => ({
  useToastStore: (selector: (state: { toast: jest.Mock }) => unknown) =>
    selector({ toast: mockToast }),
}));

const mockFetchQuery = jest.fn();
jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQueryClient: () => ({ fetchQuery: mockFetchQuery }),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const APPOINTMENT: Appointment = {
  appointmentId: "appt-1",
  appointmentName: "테스트 약속",
  appointmentDueDate: "2026-05-01",
  confirmYn: "Y",
  profileYn: "Y",
  hostYn: "Y",
  dday: "D-10",
  appointmentUserId: 1,
};

// 동률 없는 일반 결과
const RESULT: ConfirmedResult = {
  confirmedDate: "2026-04-15",
  dateVotedList: ["홍길동", "김철수"],
  dateSelectedReasonList: [],
  confirmedPlaceName: "강남역",
  confirmedPlaceAddress: "서울 강남구 강남대로 123",
  placeVotedList: ["홍길동"],
  placeSelectedReasonList: [],
};

// 날짜만 동률 추천
const RESULT_DATE_RECOMMENDED: ConfirmedResult = {
  ...RESULT,
  dateSelectedReasonList: ["두 날짜의 투표 수가 동일해요."],
  placeSelectedReasonList: [],
};

// 장소만 동률 추천
const RESULT_PLACE_RECOMMENDED: ConfirmedResult = {
  ...RESULT,
  dateSelectedReasonList: [],
  placeSelectedReasonList: ["두 장소의 투표 수가 동일해요."],
};

// 날짜·장소 모두 동률 추천
const RESULT_BOTH_RECOMMENDED: ConfirmedResult = {
  ...RESULT,
  dateSelectedReasonList: ["두 날짜의 투표 수가 동일해요."],
  placeSelectedReasonList: ["두 장소의 투표 수가 동일해요."],
};

const DEFAULT_PROPS = {
  setOpen: jest.fn(),
  appointment: APPOINTMENT,
  appointmentUserCount: 5,
  result: RESULT,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let user: ReturnType<typeof userEvent.setup>;

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  user = userEvent.setup();

  // fetchQuery: 날짜 투표 → 장소 투표 순으로 resolve
  mockFetchQuery
    .mockResolvedValueOnce({ possibleList: [], ambList: [] })
    .mockResolvedValueOnce([]);

  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: jest.fn().mockResolvedValue(undefined) },
    configurable: true,
  });
  Object.defineProperty(navigator, "share", {
    value: jest.fn().mockResolvedValue(undefined),
    configurable: true,
  });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AppointmentResultModal", () => {
  describe("렌더링", () => {
    it("확정 날짜가 표시된다", () => {
      renderWithProviders(<AppointmentResultModal {...DEFAULT_PROPS} />);

      // 2026-04-15 → "2026년 4월 15일 ..."
      expect(screen.getByText(/2026년 4월 15일/)).toBeInTheDocument();
    });

    it("확정 장소명이 표시된다", () => {
      renderWithProviders(<AppointmentResultModal {...DEFAULT_PROPS} />);

      expect(screen.getByText("강남역")).toBeInTheDocument();
    });

    it("확정 장소 주소가 표시된다", () => {
      renderWithProviders(<AppointmentResultModal {...DEFAULT_PROPS} />);

      expect(
        screen.getByText("서울 강남구 강남대로 123"),
      ).toBeInTheDocument();
    });
  });

  describe("결과 메시지", () => {
    it("동률 없으면 '정해진 일정과 장소를 확인해보세요!'가 표시된다", () => {
      renderWithProviders(<AppointmentResultModal {...DEFAULT_PROPS} />);

      expect(
        screen.getByText("정해진 일정과 장소를 확인해보세요!"),
      ).toBeInTheDocument();
    });

    it("날짜가 동률 추천이면 '투표 결과가 동일해...' 문구가 표시된다", () => {
      renderWithProviders(
        <AppointmentResultModal
          {...DEFAULT_PROPS}
          result={RESULT_DATE_RECOMMENDED}
        />,
      );

      expect(
        screen.getByText(/투표 결과가 동일해/),
      ).toBeInTheDocument();
    });

    it("장소가 동률 추천이면 '투표 결과가 동일해...' 문구가 표시된다", () => {
      renderWithProviders(
        <AppointmentResultModal
          {...DEFAULT_PROPS}
          result={RESULT_PLACE_RECOMMENDED}
        />,
      );

      expect(
        screen.getByText(/투표 결과가 동일해/),
      ).toBeInTheDocument();
    });
  });

  describe("추천 이유 토글 (날짜)", () => {
    it("날짜 추천 시 '추천 이유 보기' 영역이 표시된다", () => {
      renderWithProviders(
        <AppointmentResultModal
          {...DEFAULT_PROPS}
          result={RESULT_DATE_RECOMMENDED}
        />,
      );

      expect(screen.getAllByText("추천 이유 보기")[0]).toBeInTheDocument();
    });

    it("펼치기 버튼을 클릭하면 추천 이유 내용이 표시된다", async () => {
      // Given
      renderWithProviders(
        <AppointmentResultModal
          {...DEFAULT_PROPS}
          result={RESULT_DATE_RECOMMENDED}
        />,
      );

      // When
      await user.click(screen.getByRole("button", { name: "일정 추천 이유 펼치기" }));

      // Then
      expect(
        screen.getByText("두 날짜의 투표 수가 동일해요."),
      ).toBeInTheDocument();
    });

    it("펼친 후 접기 버튼을 클릭하면 추천 이유 내용이 사라진다", async () => {
      // Given
      renderWithProviders(
        <AppointmentResultModal
          {...DEFAULT_PROPS}
          result={RESULT_DATE_RECOMMENDED}
        />,
      );
      await user.click(screen.getByRole("button", { name: "일정 추천 이유 펼치기" }));

      // When
      await user.click(screen.getByRole("button", { name: "일정 추천 이유 접기" }));

      // Then
      expect(
        screen.queryByText("두 날짜의 투표 수가 동일해요."),
      ).not.toBeInTheDocument();
    });
  });

  describe("추천 이유 토글 (장소)", () => {
    it("펼치기 버튼을 클릭하면 장소 추천 이유 내용이 표시된다", async () => {
      // Given
      renderWithProviders(
        <AppointmentResultModal
          {...DEFAULT_PROPS}
          result={RESULT_PLACE_RECOMMENDED}
        />,
      );

      // When
      await user.click(screen.getByRole("button", { name: "장소 추천 이유 펼치기" }));

      // Then
      expect(
        screen.getByText("두 장소의 투표 수가 동일해요."),
      ).toBeInTheDocument();
    });
  });

  describe("닫기", () => {
    it("닫기 버튼을 클릭하면 setOpen(false)가 호출된다", async () => {
      // Given
      const setOpen = jest.fn();
      renderWithProviders(
        <AppointmentResultModal {...DEFAULT_PROPS} setOpen={setOpen} />,
      );

      // When
      await user.click(screen.getByRole("button", { name: "닫기" }));

      // Then
      expect(setOpen).toHaveBeenCalledWith(false);
    });
  });

  describe("공유", () => {
    it("카카오톡 버튼을 클릭하면 shareAppointmentOnKakaoTalk이 호출된다", async () => {
      renderWithProviders(<AppointmentResultModal {...DEFAULT_PROPS} />);

      await user.click(screen.getByRole("button", { name: "카카오톡" }));

      expect(mockShareAppointmentOnKakaoTalk).toHaveBeenCalledTimes(1);
    });

    it("카카오톡 공유 시 GTM kakao 이벤트가 전송된다", async () => {
      renderWithProviders(<AppointmentResultModal {...DEFAULT_PROPS} />);

      await user.click(screen.getByRole("button", { name: "카카오톡" }));

      expect(mockSendGTM).toHaveBeenCalledWith(
        expect.objectContaining({ share_method: "kakao", share_context: "result" }),
      );
    });

    it("더보기 버튼을 클릭하면 navigator.share가 호출된다", async () => {
      renderWithProviders(<AppointmentResultModal {...DEFAULT_PROPS} />);

      await user.click(screen.getByRole("button", { name: "더보기" }));

      expect(navigator.share).toHaveBeenCalledTimes(1);
    });

    it("더보기 공유 완료 후 GTM system_share 이벤트가 전송된다", async () => {
      renderWithProviders(<AppointmentResultModal {...DEFAULT_PROPS} />);

      await user.click(screen.getByRole("button", { name: "더보기" }));

      await waitFor(() =>
        expect(mockSendGTM).toHaveBeenCalledWith(
          expect.objectContaining({ share_method: "system_share" }),
        ),
      );
    });

    it("링크 복사 버튼을 클릭하면 클립보드에 복사된다", async () => {
      renderWithProviders(<AppointmentResultModal {...DEFAULT_PROPS} />);

      await user.click(screen.getByRole("button", { name: "링크 복사" }));

      await waitFor(() =>
        expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1),
      );
    });

    it("링크 복사 후 '복사가 완료됐어요.' toast를 표시한다", async () => {
      renderWithProviders(<AppointmentResultModal {...DEFAULT_PROPS} />);

      await user.click(screen.getByRole("button", { name: "링크 복사" }));

      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith({ message: "복사가 완료됐어요." }),
      );
    });

    it("링크 복사 후 GTM link_copy 이벤트가 전송된다", async () => {
      renderWithProviders(<AppointmentResultModal {...DEFAULT_PROPS} />);

      await user.click(screen.getByRole("button", { name: "링크 복사" }));

      await waitFor(() =>
        expect(mockSendGTM).toHaveBeenCalledWith(
          expect.objectContaining({ share_method: "link_copy" }),
        ),
      );
    });

    it("hostYn='Y'이면 GTM 이벤트에 user_role: 'host'가 포함된다", async () => {
      renderWithProviders(
        <AppointmentResultModal
          {...DEFAULT_PROPS}
          appointment={{ ...APPOINTMENT, hostYn: "Y" }}
        />,
      );

      await user.click(screen.getByRole("button", { name: "카카오톡" }));

      expect(mockSendGTM).toHaveBeenCalledWith(
        expect.objectContaining({ user_role: "host" }),
      );
    });

    it("hostYn='N'이면 GTM 이벤트에 user_role: 'guest'가 포함된다", async () => {
      renderWithProviders(
        <AppointmentResultModal
          {...DEFAULT_PROPS}
          appointment={{ ...APPOINTMENT, hostYn: "N" }}
        />,
      );

      await user.click(screen.getByRole("button", { name: "카카오톡" }));

      expect(mockSendGTM).toHaveBeenCalledWith(
        expect.objectContaining({ user_role: "guest" }),
      );
    });
  });

  describe("주소 복사", () => {
    it("주소 복사 버튼을 클릭하면 클립보드에 주소가 복사된다", async () => {
      renderWithProviders(<AppointmentResultModal {...DEFAULT_PROPS} />);

      await user.click(screen.getByRole("button", { name: "주소 복사" }));

      await waitFor(() =>
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          RESULT.confirmedPlaceAddress,
        ),
      );
    });

    it("주소 복사 후 '복사가 완료됐어요.' toast를 표시한다", async () => {
      renderWithProviders(<AppointmentResultModal {...DEFAULT_PROPS} />);

      await user.click(screen.getByRole("button", { name: "주소 복사" }));

      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith({ message: "복사가 완료됐어요." }),
      );
    });
  });

  describe("GTM view_result 이벤트", () => {
    it("모달이 표시되면 view_result GTM 이벤트를 전송한다", async () => {
      renderWithProviders(<AppointmentResultModal {...DEFAULT_PROPS} />);

      await waitFor(() =>
        expect(mockSendGTM).toHaveBeenCalledWith(
          expect.objectContaining({ event: "view_result" }),
        ),
      );
    });
  });
});
