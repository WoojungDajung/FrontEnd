import React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils/render";
import EditAppointmentForm from "./EditAppointmentForm";

// ---------------------------------------------------------------------------
// Module mocks (외부 경계만 mock)
// ---------------------------------------------------------------------------

const mockToast = jest.fn();
jest.mock("@/src/shared/toast/toastStore", () => ({
  useToastStore: (selector: (state: { toast: jest.Mock }) => unknown) =>
    selector({ toast: mockToast }),
}));

const mockSendGTM = jest.fn();
jest.mock("@/src/shared/lib/googleTagManager/sendGTM", () => ({
  sendGTM: (...args: unknown[]) => mockSendGTM(...args),
}));

// DateInput: createPortal 기반 달력 picker → 클릭 시 onValueChange를 직접 호출하는 버튼으로 대체
jest.mock("@/src/shared/ui/DateInput", () => ({
  __esModule: true,
  default: ({
    onValueChange,
  }: {
    value?: Date;
    onValueChange?: (v: Date | undefined) => void;
  }) => (
    <button
      type="button"
      aria-label="날짜 선택"
      onClick={() => onValueChange?.(new Date("2026-07-01"))}
    >
      날짜 선택
    </button>
  ),
}));

// LoadingSpinner: onClose 트리거 버튼 제공 (onSubmitSuccess prop 호출 경로 테스트용)
jest.mock("@/src/shared/ui/LoadingSpinner", () => ({
  __esModule: true,
  default: ({
    open,
    success,
    onClose,
  }: {
    open: boolean;
    success?: boolean;
    onClose?: () => void;
  }) =>
    open ? (
      <div data-testid="loading-spinner" data-success={String(success)}>
        <button type="button" aria-label="스피너 닫기" onClick={onClose}>
          닫기
        </button>
      </div>
    ) : null,
}));

// ---------------------------------------------------------------------------
// fetch mock
// ---------------------------------------------------------------------------

const mockFetch = jest.fn();

beforeEach(() => {
  global.fetch = mockFetch;
  process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
});

// ---------------------------------------------------------------------------
// 응답 fixture 헬퍼
// ---------------------------------------------------------------------------

function mockFetchSuccess() {
  mockFetch.mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        status_code: 200,
        data: {
          appointment: {
            appointmentId: "appt-1",
            appointmentName: "수정된 약속",
            appointmentDueDate: "2026-07-01",
            confirmYn: "N",
            profileYn: "N",
            hostYn: "Y",
            dday: "D-100",
            appointmentUserId: 1,
          },
          appointmentUserList: [],
          confirmedResult: null,
        },
      }),
  });
}

function mockFetchError() {
  mockFetch.mockResolvedValue({
    ok: false,
    json: () => Promise.resolve({ status_code: 500, message: "서버 오류" }),
  });
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const DEFAULT_PROPS = {
  appointmentId: "appt-1",
  initialName: "테스트 약속",
  initialDeadline: "2026-03-01",
  meta: { isHost: true, isConfirmed: false },
};

// ---------------------------------------------------------------------------
// 헬퍼
// ---------------------------------------------------------------------------

/** 이름 필드를 변경해 버튼이 활성화될 때까지 대기 */
async function changeName(newName = "수정된 약속") {
  fireEvent.change(screen.getByDisplayValue(DEFAULT_PROPS.initialName), {
    target: { value: newName },
  });
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "등록하기" })).toBeEnabled(),
  );
}

// ---------------------------------------------------------------------------
// 테스트
// ---------------------------------------------------------------------------

describe("EditAppointmentForm 통합", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe("폼 유효성 검사", () => {
    it("초기 상태에서 등록 버튼이 비활성화된다", () => {
      renderWithProviders(<EditAppointmentForm {...DEFAULT_PROPS} />);

      expect(screen.getByRole("button", { name: "등록하기" })).toBeDisabled();
    });

    it("이름을 변경하면 등록 버튼이 활성화된다", async () => {
      renderWithProviders(<EditAppointmentForm {...DEFAULT_PROPS} />);

      await changeName();
    });

    it("날짜를 변경하면 등록 버튼이 활성화된다", async () => {
      renderWithProviders(<EditAppointmentForm {...DEFAULT_PROPS} />);

      await user.click(screen.getByRole("button", { name: "날짜 선택" }));

      await waitFor(() =>
        expect(screen.getByRole("button", { name: "등록하기" })).toBeEnabled(),
      );
    });

    it("이름을 모두 지우면 등록 버튼이 비활성화된다", async () => {
      renderWithProviders(<EditAppointmentForm {...DEFAULT_PROPS} />);

      // user.clear()는 keyboard 시뮬레이션으로 RHF re-validation이 동시에 실행되지
      // 않을 수 있으므로 fireEvent.change로 직접 동기 호출한다.
      fireEvent.change(screen.getByDisplayValue(DEFAULT_PROPS.initialName), {
        target: { value: "" },
      });

      await waitFor(() =>
        expect(screen.getByRole("button", { name: "등록하기" })).toBeDisabled(),
      );
    });
  });

  describe("저장 성공", () => {
    beforeEach(() => {
      mockFetchSuccess();
    });

    it("저장 성공 시 '저장이 완료됐어요.' toast가 표시된다", async () => {
      renderWithProviders(<EditAppointmentForm {...DEFAULT_PROPS} />);

      await changeName();
      await user.click(screen.getByRole("button", { name: "등록하기" }));

      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith({ message: "저장이 완료됐어요." }),
      );
    });

    it("저장 성공 후 스피너가 닫히면 onSubmitSuccess prop이 호출된다", async () => {
      const onSubmitSuccess = jest.fn();
      renderWithProviders(
        <EditAppointmentForm {...DEFAULT_PROPS} onSubmitSuccess={onSubmitSuccess} />,
      );

      await changeName();
      await user.click(screen.getByRole("button", { name: "등록하기" }));

      await waitFor(() =>
        expect(screen.getByTestId("loading-spinner")).toBeInTheDocument(),
      );
      await user.click(screen.getByRole("button", { name: "스피너 닫기" }));

      expect(onSubmitSuccess).toHaveBeenCalledTimes(1);
    });

    it("이름만 변경 시 GTM edit_name=true, edit_deadline=false 이벤트가 전송된다", async () => {
      renderWithProviders(<EditAppointmentForm {...DEFAULT_PROPS} />);

      await changeName();
      await user.click(screen.getByRole("button", { name: "등록하기" }));

      await waitFor(() =>
        expect(mockSendGTM).toHaveBeenCalledWith(
          expect.objectContaining({
            event: "edit_appointment",
            edit_name: true,
            edit_deadline: false,
          }),
        ),
      );
    });

    it("날짜만 변경 시 GTM edit_name=false, edit_deadline=true 이벤트가 전송된다", async () => {
      renderWithProviders(<EditAppointmentForm {...DEFAULT_PROPS} />);

      await user.click(screen.getByRole("button", { name: "날짜 선택" }));
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "등록하기" })).toBeEnabled(),
      );
      await user.click(screen.getByRole("button", { name: "등록하기" }));

      await waitFor(() =>
        expect(mockSendGTM).toHaveBeenCalledWith(
          expect.objectContaining({
            event: "edit_appointment",
            edit_name: false,
            edit_deadline: true,
          }),
        ),
      );
    });

    it("isHost=true이면 GTM user_role: 'host'가 포함된다", async () => {
      renderWithProviders(
        <EditAppointmentForm {...DEFAULT_PROPS} meta={{ isHost: true, isConfirmed: false }} />,
      );

      await changeName();
      await user.click(screen.getByRole("button", { name: "등록하기" }));

      await waitFor(() =>
        expect(mockSendGTM).toHaveBeenCalledWith(
          expect.objectContaining({ user_role: "host" }),
        ),
      );
    });

    it("isHost=false이면 GTM user_role: 'guest'가 포함된다", async () => {
      renderWithProviders(
        <EditAppointmentForm
          {...DEFAULT_PROPS}
          meta={{ isHost: false, isConfirmed: false }}
        />,
      );

      await changeName();
      await user.click(screen.getByRole("button", { name: "등록하기" }));

      await waitFor(() =>
        expect(mockSendGTM).toHaveBeenCalledWith(
          expect.objectContaining({ user_role: "guest" }),
        ),
      );
    });
  });

  describe("저장 실패", () => {
    beforeEach(() => {
      mockFetchError();
    });

    it("저장 실패 시 '저장에 실패했어요.' toast가 표시된다", async () => {
      renderWithProviders(<EditAppointmentForm {...DEFAULT_PROPS} />);

      await changeName();
      await user.click(screen.getByRole("button", { name: "등록하기" }));

      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith({
          message: "저장에 실패했어요. 잠시후 다시 시도해주세요.",
        }),
      );
    });

    it("저장 실패 시 GTM 이벤트는 전송되지 않는다", async () => {
      renderWithProviders(<EditAppointmentForm {...DEFAULT_PROPS} />);

      await changeName();
      await user.click(screen.getByRole("button", { name: "등록하기" }));

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockSendGTM).not.toHaveBeenCalled();
    });
  });
});
