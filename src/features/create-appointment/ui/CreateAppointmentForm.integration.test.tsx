import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/test-utils/mocks/server";
import { renderWithProviders } from "@/test-utils/render";
import CreateAppointmentForm from "./CreateAppointmentForm";

// ---------------------------------------------------------------------------
// Module mocks (외부 경계만 mock)
// ---------------------------------------------------------------------------

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
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

// DateInput: createPortal 기반 달력 picker → 단순 버튼으로 대체
jest.mock("@/src/shared/ui/DateInput", () => ({
  __esModule: true,
  default: ({
    value,
    onValueChange,
  }: {
    value?: Date;
    onValueChange?: (v: Date | undefined) => void;
  }) => (
    <button
      type="button"
      aria-label="날짜 선택"
      onClick={() => onValueChange?.(new Date("2026-06-01"))}
    >
      {value ? "날짜 선택됨" : "날짜 미선택"}
    </button>
  ),
}));

// AddressInput: Daum 우편번호 팝업 → 빈 div로 대체 (선택 필드이므로 동작 불필요)
jest.mock("@/src/shared/ui/AddressInput", () => ({
  __esModule: true,
  default: () => <div />,
}));

// ---------------------------------------------------------------------------
// MSW
// ---------------------------------------------------------------------------

// nextJest는 .env.development를 테스트 환경에서 로드하지 않으므로 명시적으로 설정
process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
const APPOINTMENT_URL = "http://localhost:3000/proxy/auth-api/appointment";

// ---------------------------------------------------------------------------
// DOM 설정 (createPortal 컨테이너)
// ---------------------------------------------------------------------------

beforeEach(() => {
  const popup = document.createElement("div");
  popup.id = "popup";
  document.body.appendChild(popup);
});

afterEach(() => {
  document.getElementById("popup")?.remove();
});

// ---------------------------------------------------------------------------
// 성공 응답 fixture
// ---------------------------------------------------------------------------

const SUCCESS_RESPONSE = {
  status_code: 200,
  data: {
    appointment: {
      appointmentId: "new-appt-id",
      appointmentName: "테스트 약속",
      appointmentDueDate: "2026-06-01",
      confirmYn: "N",
      profileYn: "N",
      hostYn: "Y",
      dday: "D-70",
      appointmentUserId: 1,
    },
    appointmentUserList: [],
    confirmedResult: null,
  },
};

// ---------------------------------------------------------------------------
// 헬퍼
// ---------------------------------------------------------------------------

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("예) 노란고양이파"), "테스트 약속");
  await user.click(screen.getByRole("button", { name: "날짜 선택" }));
  await user.type(screen.getByPlaceholderText("예) 애옹이"), "홍길동");
}

// ---------------------------------------------------------------------------
// 테스트
// ---------------------------------------------------------------------------

describe("CreateAppointmentForm 통합", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe("폼 유효성 검사", () => {
    it("초기 상태에서 제출 버튼이 비활성화된다", () => {
      renderWithProviders(<CreateAppointmentForm />);

      expect(
        screen.getByRole("button", { name: "약속 정하러 가기" }),
      ).toBeDisabled();
    });

    it("약속 이름 없이 날짜·이름만 채우면 제출 버튼이 비활성화된다", async () => {
      renderWithProviders(<CreateAppointmentForm />);

      await user.click(screen.getByRole("button", { name: "날짜 선택" }));
      await user.type(screen.getByPlaceholderText("예) 애옹이"), "홍길동");

      expect(
        screen.getByRole("button", { name: "약속 정하러 가기" }),
      ).toBeDisabled();
    });

    it("날짜 없이 약속 이름·이름만 채우면 제출 버튼이 비활성화된다", async () => {
      renderWithProviders(<CreateAppointmentForm />);

      await user.type(
        screen.getByPlaceholderText("예) 노란고양이파"),
        "테스트 약속",
      );
      await user.type(screen.getByPlaceholderText("예) 애옹이"), "홍길동");

      expect(
        screen.getByRole("button", { name: "약속 정하러 가기" }),
      ).toBeDisabled();
    });

    it("필수 필드(약속 이름, 날짜, 이름)를 모두 채우면 제출 버튼이 활성화된다", async () => {
      renderWithProviders(<CreateAppointmentForm />);

      await fillRequiredFields(user);

      expect(
        screen.getByRole("button", { name: "약속 정하러 가기" }),
      ).toBeEnabled();
    });
  });

  describe("약속 생성 성공", () => {
    beforeEach(() => {
      server.use(
        http.post(APPOINTMENT_URL, () => HttpResponse.json(SUCCESS_RESPONSE)),
      );
    });

    it("폼 제출 후 약속 상세 페이지로 이동한다", async () => {
      renderWithProviders(<CreateAppointmentForm />);

      await fillRequiredFields(user);
      await user.click(
        screen.getByRole("button", { name: "약속 정하러 가기" }),
      );

      await waitFor(() =>
        expect(mockPush).toHaveBeenCalledWith("/appointment/new-appt-id"),
      );
    });

    it("폼 제출 성공 시 GTM create_appointment 이벤트가 전송된다", async () => {
      renderWithProviders(<CreateAppointmentForm />);

      await fillRequiredFields(user);
      await user.click(
        screen.getByRole("button", { name: "약속 정하러 가기" }),
      );

      await waitFor(() =>
        expect(mockSendGTM).toHaveBeenCalledWith(
          expect.objectContaining({
            event: "create_appointment",
            appointment_id: "new-appt-id",
          }),
        ),
      );
    });

    it("GTM 이벤트에 deadline_time이 포함된다", async () => {
      renderWithProviders(<CreateAppointmentForm />);

      await fillRequiredFields(user);
      await user.click(
        screen.getByRole("button", { name: "약속 정하러 가기" }),
      );

      await waitFor(() =>
        expect(mockSendGTM).toHaveBeenCalledWith(
          expect.objectContaining({ deadline_time: "2026-06-01" }),
        ),
      );
    });
  });

  describe("약속 생성 실패", () => {
    beforeEach(() => {
      server.use(
        http.post(APPOINTMENT_URL, () =>
          HttpResponse.json(
            { status_code: 500, message: "서버 오류" },
            { status: 500 },
          ),
        ),
      );
    });

    it("API 오류 시 실패 toast가 표시된다", async () => {
      renderWithProviders(<CreateAppointmentForm />);

      await fillRequiredFields(user);
      await user.click(
        screen.getByRole("button", { name: "약속 정하러 가기" }),
      );

      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith({
          message: "생성에 실패했어요. 잠시 후 다시 시도해주세요.",
        }),
      );
    });

    it("API 오류 시 router.push는 호출되지 않는다", async () => {
      renderWithProviders(<CreateAppointmentForm />);

      await fillRequiredFields(user);
      await user.click(
        screen.getByRole("button", { name: "약속 정하러 가기" }),
      );

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("API 오류 시 GTM 이벤트는 전송되지 않는다", async () => {
      renderWithProviders(<CreateAppointmentForm />);

      await fillRequiredFields(user);
      await user.click(
        screen.getByRole("button", { name: "약속 정하러 가기" }),
      );

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockSendGTM).not.toHaveBeenCalled();
    });
  });
});
