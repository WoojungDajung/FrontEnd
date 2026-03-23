import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils/render";
import EditProfileDrawer from "./EditProfileDrawer";

// ---------------------------------------------------------------------------
// Module mocks (외부 경계만 mock)
// ---------------------------------------------------------------------------

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockConfirm = jest.fn();
jest.mock("@/src/shared/confirm/confirmStore", () => ({
  useConfirmStore: (selector: (state: { confirm: jest.Mock }) => unknown) =>
    selector({ confirm: mockConfirm }),
}));

const mockToast = jest.fn();
jest.mock("@/src/shared/toast/toastStore", () => ({
  useToastStore: (selector: (state: { toast: jest.Mock }) => unknown) =>
    selector({ toast: mockToast }),
}));

// EditProfileForm: 폼 로직은 EditProfileForm.integration.test.tsx에서 검증.
// 여기서는 onSubmitSuccess 연결 확인만 하므로 트리거 버튼으로 대체한다.
jest.mock("./EditProfileForm", () => ({
  __esModule: true,
  default: ({ onSubmitSuccess }: { onSubmitSuccess?: () => void }) => (
    <button type="button" onClick={onSubmitSuccess}>
      저장 성공 트리거
    </button>
  ),
}));

// BottomDrawer: portal + 애니메이션 → close() 호출 시 onOpenChange(false)를 실행하는 wrapper로 대체
jest.mock("@/src/shared/ui/BottomDrawer", () => ({
  __esModule: true,
  default: ({
    open,
    onOpenChange,
    children,
  }: {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    children: (api: { close: () => void }) => React.ReactNode;
  }) => {
    const close = () => onOpenChange?.(false);
    return open ? <>{children({ close })}</> : null;
  },
}));

// LoadingSpinner: 나가기 로딩 오버레이 (동작 검증 불필요)
jest.mock("@/src/shared/ui/LoadingSpinner", () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="loading-spinner" /> : null,
}));

// ---------------------------------------------------------------------------
// fetch mock
// ---------------------------------------------------------------------------

const mockFetch = jest.fn();

beforeEach(() => {
  global.fetch = mockFetch;
  process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
  mockConfirm.mockResolvedValue(true);
});

// ---------------------------------------------------------------------------
// 응답 fixture 헬퍼
// ---------------------------------------------------------------------------

function setupFetch(leaveOk = true) {
  mockFetch.mockResolvedValue({
    ok: leaveOk,
    json: () =>
      Promise.resolve(
        leaveOk
          ? { status_code: 200, data: {} }
          : { status_code: 500, message: "서버 오류" },
      ),
  });
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const DEFAULT_PROPS = {
  appointmentId: "appt-1",
  initialProfile: {
    id: 1,
    memberNickName: "테스트유저",
    startingPlace: null,
  },
  canLeaveAppointment: true,
  open: true,
  setOpen: jest.fn(),
};

// ---------------------------------------------------------------------------
// 테스트
// ---------------------------------------------------------------------------

describe("EditProfileDrawer 통합", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    setupFetch();
  });

  describe("약속 나가기 버튼 표시 여부", () => {
    it("canLeaveAppointment=true이면 '약속 나가기' 버튼이 표시된다", () => {
      renderWithProviders(
        <EditProfileDrawer {...DEFAULT_PROPS} canLeaveAppointment={true} />,
      );

      expect(
        screen.getByRole("button", { name: "약속 나가기" }),
      ).toBeInTheDocument();
    });

    it("canLeaveAppointment=false이면 '약속 나가기' 버튼이 표시되지 않는다", () => {
      renderWithProviders(
        <EditProfileDrawer {...DEFAULT_PROPS} canLeaveAppointment={false} />,
      );

      expect(
        screen.queryByRole("button", { name: "약속 나가기" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("약속 나가기 — confirm 확인", () => {
    it("DELETE API가 호출된다", async () => {
      renderWithProviders(<EditProfileDrawer {...DEFAULT_PROPS} />);

      await user.click(screen.getByRole("button", { name: "약속 나가기" }));

      await waitFor(() =>
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("appointment/participant/appt-1"),
          expect.objectContaining({ method: "DELETE" }),
        ),
      );
    });

    it("나가기 성공 시 약속 목록 페이지로 이동한다", async () => {
      renderWithProviders(<EditProfileDrawer {...DEFAULT_PROPS} />);

      await user.click(screen.getByRole("button", { name: "약속 나가기" }));

      await waitFor(() =>
        expect(mockPush).toHaveBeenCalledWith("/appointments"),
      );
    });

    it("나가기 성공 시 toast는 표시되지 않는다", async () => {
      renderWithProviders(<EditProfileDrawer {...DEFAULT_PROPS} />);

      await user.click(screen.getByRole("button", { name: "약속 나가기" }));

      await waitFor(() => expect(mockPush).toHaveBeenCalled());
      expect(mockToast).not.toHaveBeenCalled();
    });
  });

  describe("약속 나가기 — confirm 취소", () => {
    it("confirm 취소 시 DELETE API가 호출되지 않는다", async () => {
      mockConfirm.mockResolvedValue(false);
      renderWithProviders(<EditProfileDrawer {...DEFAULT_PROPS} />);

      await user.click(screen.getByRole("button", { name: "약속 나가기" }));

      await waitFor(() => expect(mockConfirm).toHaveBeenCalled());
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("약속 나가기 실패", () => {
    beforeEach(() => {
      setupFetch(false);
    });

    it("'약속나가기에 실패했어요.' toast가 표시된다", async () => {
      renderWithProviders(<EditProfileDrawer {...DEFAULT_PROPS} />);

      await user.click(screen.getByRole("button", { name: "약속 나가기" }));

      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith({
          message: "약속나가기에 실패했어요. 잠시후 다시 시도해주세요.",
        }),
      );
    });

    it("나가기 실패 시 router.push는 호출되지 않는다", async () => {
      renderWithProviders(<EditProfileDrawer {...DEFAULT_PROPS} />);

      await user.click(screen.getByRole("button", { name: "약속 나가기" }));

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("폼 저장 성공 후 drawer 닫힘", () => {
    it("저장 성공 시 setOpen(false)가 호출된다", async () => {
      const setOpen = jest.fn();
      renderWithProviders(
        <EditProfileDrawer {...DEFAULT_PROPS} setOpen={setOpen} />,
      );

      await user.click(screen.getByRole("button", { name: "저장 성공 트리거" }));

      expect(setOpen).toHaveBeenCalledWith(false);
    });
  });
});
