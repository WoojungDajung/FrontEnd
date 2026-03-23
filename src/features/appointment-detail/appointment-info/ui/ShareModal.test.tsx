import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils/render";
import ShareModal from "./ShareModal";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

// next/script: JSDOM에서 외부 스크립트 로딩 불필요
jest.mock("next/script", () => ({
  __esModule: true,
  default: () => null,
}));

// Modal: createPortal 없이 children을 직접 렌더링하는 mock으로 대체.
// onOpenChange(false)를 호출하는 close 함수를 children에게 전달한다.
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

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const DEFAULT_PROPS = {
  appointmentId: "appt-1",
  appointmentName: "테스트 약속",
  setOpen: jest.fn(),
  isHost: true,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let user: ReturnType<typeof userEvent.setup>;

/** GTM ID로 지정된 공유 버튼을 찾아 반환한다. */
function getShareButton(id: "btn_share_kakao" | "btn_share_sheet" | "btn_copy_link") {
  return document.getElementById(id) as HTMLElement;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  user = userEvent.setup();

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

describe("ShareModal", () => {
  describe("렌더링", () => {
    it("공유 안내 문구가 표시된다", () => {
      // Given / When
      renderWithProviders(<ShareModal {...DEFAULT_PROPS} />);

      // Then
      expect(
        screen.getByText("만날우정, 함께할 친구를 불러보세요!"),
      ).toBeInTheDocument();
    });
  });

  describe("닫기", () => {
    it("닫기 버튼을 클릭하면 setOpen(false)가 호출된다", async () => {
      // Given
      const setOpen = jest.fn();
      renderWithProviders(<ShareModal {...DEFAULT_PROPS} setOpen={setOpen} />);

      // When
      await user.click(screen.getByRole("button", { name: "닫기" }));

      // Then
      expect(setOpen).toHaveBeenCalledWith(false);
    });
  });

  describe("링크 복사", () => {
    it("클립보드에 링크를 복사한다", async () => {
      // Given
      renderWithProviders(<ShareModal {...DEFAULT_PROPS} />);

      // When
      await user.click(getShareButton("btn_copy_link"));

      // Then
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    });

    it("복사 완료 후 toast를 표시한다", async () => {
      // Given
      renderWithProviders(<ShareModal {...DEFAULT_PROPS} />);

      // When
      await user.click(getShareButton("btn_copy_link"));

      // Then
      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith({ message: "복사가 완료됐어요." }),
      );
    });

    it("복사 완료 후 GTM link_copy 이벤트를 전송한다", async () => {
      // Given
      renderWithProviders(<ShareModal {...DEFAULT_PROPS} />);

      // When
      await user.click(getShareButton("btn_copy_link"));

      // Then
      await waitFor(() =>
        expect(mockSendGTM).toHaveBeenCalledWith(
          expect.objectContaining({ share_method: "link_copy" }),
        ),
      );
    });
  });

  describe("카카오톡 공유", () => {
    it("shareAppointmentOnKakaoTalk을 호출한다", async () => {
      // Given
      renderWithProviders(<ShareModal {...DEFAULT_PROPS} />);

      // When
      await user.click(getShareButton("btn_share_kakao"));

      // Then
      expect(mockShareAppointmentOnKakaoTalk).toHaveBeenCalledTimes(1);
    });

    it("GTM kakao 이벤트를 전송한다", async () => {
      // Given
      renderWithProviders(<ShareModal {...DEFAULT_PROPS} />);

      // When
      await user.click(getShareButton("btn_share_kakao"));

      // Then
      expect(mockSendGTM).toHaveBeenCalledWith(
        expect.objectContaining({ share_method: "kakao" }),
      );
    });
  });

  describe("더보기 공유", () => {
    it("navigator.share를 호출한다", async () => {
      // Given
      renderWithProviders(<ShareModal {...DEFAULT_PROPS} />);

      // When
      await user.click(getShareButton("btn_share_sheet"));

      // Then
      expect(navigator.share).toHaveBeenCalledTimes(1);
    });

    it("공유 완료 후 GTM system_share 이벤트를 전송한다", async () => {
      // Given
      renderWithProviders(<ShareModal {...DEFAULT_PROPS} />);

      // When
      await user.click(getShareButton("btn_share_sheet"));

      // Then
      await waitFor(() =>
        expect(mockSendGTM).toHaveBeenCalledWith(
          expect.objectContaining({ share_method: "system_share" }),
        ),
      );
    });
  });

  describe("GTM user_role", () => {
    it("isHost가 true이면 GTM 이벤트에 user_role: 'host'가 포함된다", async () => {
      // Given
      renderWithProviders(<ShareModal {...DEFAULT_PROPS} isHost={true} />);

      // When — 카카오톡 공유는 동기 처리라 waitFor 불필요
      await user.click(getShareButton("btn_share_kakao"));

      // Then
      expect(mockSendGTM).toHaveBeenCalledWith(
        expect.objectContaining({ user_role: "host" }),
      );
    });

    it("isHost가 false이면 GTM 이벤트에 user_role: 'guest'가 포함된다", async () => {
      // Given
      renderWithProviders(<ShareModal {...DEFAULT_PROPS} isHost={false} />);

      // When
      await user.click(getShareButton("btn_share_kakao"));

      // Then
      expect(mockSendGTM).toHaveBeenCalledWith(
        expect.objectContaining({ user_role: "guest" }),
      );
    });
  });
});
