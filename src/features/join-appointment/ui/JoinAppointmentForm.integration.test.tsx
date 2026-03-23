import React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils/render";
import JoinAppointmentForm from "./JoinAppointmentForm";

// ---------------------------------------------------------------------------
// Module mocks (외부 경계만 mock)
// ---------------------------------------------------------------------------

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockToast = jest.fn();
jest.mock("@/src/shared/toast/toastStore", () => ({
  useToastStore: (selector: (state: { toast: jest.Mock }) => unknown) =>
    selector({ toast: mockToast }),
}));

// AddressInput: Daum 우편번호 팝업 → 클릭 시 onChange를 직접 호출하는 버튼으로 대체
jest.mock("@/src/shared/ui/AddressInput", () => ({
  __esModule: true,
  default: ({
    onChange,
  }: {
    inputId?: string;
    value?: unknown;
    onChange: (v: { address: string; placeName?: string }) => void;
    placeholder?: string;
  }) => (
    <button
      type="button"
      aria-label="주소 검색"
      onClick={() =>
        onChange({ address: "서울 강서구 마곡동로 161", placeName: "마곡나루역" })
      }
    >
      주소 검색
    </button>
  ),
}));

// LoadingSpinner: createPortal 렌더링만 확인하면 되므로 최소 mock
jest.mock("@/src/shared/ui/LoadingSpinner", () => ({
  __esModule: true,
  default: ({ open }: { open: boolean; success?: boolean }) =>
    open ? <div data-testid="loading-spinner" /> : null,
}));

// ---------------------------------------------------------------------------
// fetch mock
// ---------------------------------------------------------------------------

const mockFetch = jest.fn();

beforeEach(() => {
  global.fetch = mockFetch;
  process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";

  // createPortal 컨테이너
  const popup = document.createElement("div");
  popup.id = "popup";
  document.body.appendChild(popup);
});

afterEach(() => {
  document.getElementById("popup")?.remove();
});

// ---------------------------------------------------------------------------
// 응답 fixture 헬퍼
// ---------------------------------------------------------------------------

const JOIN_SUCCESS = {
  status_code: 200,
  data: {
    appointment: {
      appointmentId: "appt-1",
      appointmentName: "테스트 약속",
      appointmentDueDate: "2026-06-01",
      confirmYn: "N",
      profileYn: "N",
      hostYn: "N",
      dday: "D-70",
      appointmentUserId: 2,
    },
    appointmentUserList: [],
    confirmedResult: null,
  },
};

function setupFetch(joinOk = true) {
  mockFetch.mockImplementation((url: string) => {
    // 주소 → 좌표 변환 (출발 장소 입력 시)
    if (url.includes("kakao")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ latitude: "37.123", longitude: "127.456" }),
      });
    }
    // 약속 참여 API
    return Promise.resolve({
      ok: joinOk,
      json: () =>
        Promise.resolve(
          joinOk ? JOIN_SUCCESS : { status_code: 500, message: "서버 오류" },
        ),
    });
  });
}

// ---------------------------------------------------------------------------
// 헬퍼
// ---------------------------------------------------------------------------

async function fillName(
  user: ReturnType<typeof userEvent.setup>,
  name = "홍길동",
) {
  await user.type(screen.getByPlaceholderText("예) 애옹이"), name);
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "약속 함께하기" }),
    ).toBeEnabled(),
  );
}

// ---------------------------------------------------------------------------
// 테스트
// ---------------------------------------------------------------------------

describe("JoinAppointmentForm 통합", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    setupFetch();
  });

  describe("폼 유효성 검사", () => {
    it("초기 상태에서 제출 버튼이 비활성화된다", () => {
      renderWithProviders(<JoinAppointmentForm appointmentId="appt-1" />);

      expect(
        screen.getByRole("button", { name: "약속 함께하기" }),
      ).toBeDisabled();
    });

    it("이름을 입력하면 제출 버튼이 활성화된다", async () => {
      renderWithProviders(<JoinAppointmentForm appointmentId="appt-1" />);

      await fillName(user);
    });

    it("이름이 8자를 초과하면 제출 버튼이 비활성화된다", async () => {
      renderWithProviders(<JoinAppointmentForm appointmentId="appt-1" />);

      // userEvent.type은 HTML maxLength를 준수하므로 fireEvent로 RHF 규칙을 직접 검증한다
      fireEvent.change(screen.getByPlaceholderText("예) 애옹이"), {
        target: { value: "이름이너무길어요오오" }, // 9자
      });

      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "약속 함께하기" }),
        ).toBeDisabled(),
      );
    });
  });

  describe("참여 성공", () => {
    it("이름만 입력 후 제출하면 약속 상세 페이지로 이동한다", async () => {
      renderWithProviders(<JoinAppointmentForm appointmentId="appt-1" />);

      await fillName(user);
      await user.click(screen.getByRole("button", { name: "약속 함께하기" }));

      await waitFor(() =>
        expect(mockPush).toHaveBeenCalledWith("/appointment/appt-1"),
      );
    });

    it("API 페이로드에 입력한 nickName이 포함된다", async () => {
      renderWithProviders(<JoinAppointmentForm appointmentId="appt-1" />);

      await fillName(user, "홍길동");
      await user.click(screen.getByRole("button", { name: "약속 함께하기" }));

      await waitFor(() => {
        const joinCall = mockFetch.mock.calls.find(([url]) =>
          (url as string).includes("appointment/join"),
        );
        const body = JSON.parse((joinCall?.[1] as RequestInit).body as string);
        expect(body.nickName).toBe("홍길동");
      });
    });

    it("출발 장소 입력 시 좌표 변환 API(kakao)가 호출된다", async () => {
      renderWithProviders(<JoinAppointmentForm appointmentId="appt-1" />);

      await fillName(user);
      await user.click(screen.getByRole("button", { name: "주소 검색" }));
      await user.click(screen.getByRole("button", { name: "약속 함께하기" }));

      await waitFor(() =>
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("kakao"),
        ),
      );
    });

    it("출발 장소 입력 후 제출하면 API 페이로드에 주소와 좌표가 포함된다", async () => {
      renderWithProviders(<JoinAppointmentForm appointmentId="appt-1" />);

      await fillName(user);
      await user.click(screen.getByRole("button", { name: "주소 검색" }));
      await user.click(screen.getByRole("button", { name: "약속 함께하기" }));

      await waitFor(() => {
        const joinCall = mockFetch.mock.calls.find(([url]) =>
          (url as string).includes("appointment/join"),
        );
        const body = JSON.parse((joinCall?.[1] as RequestInit).body as string);
        expect(body.address).toBe("서울 강서구 마곡동로 161");
        expect(body.latitude).toBe("37.123");
        expect(body.longitude).toBe("127.456");
      });
    });

    it("출발 장소 입력 후 제출하면 약속 상세 페이지로 이동한다", async () => {
      renderWithProviders(<JoinAppointmentForm appointmentId="appt-1" />);

      await fillName(user);
      await user.click(screen.getByRole("button", { name: "주소 검색" }));
      await user.click(screen.getByRole("button", { name: "약속 함께하기" }));

      await waitFor(() =>
        expect(mockPush).toHaveBeenCalledWith("/appointment/appt-1"),
      );
    });
  });

  describe("참여 실패", () => {
    beforeEach(() => {
      setupFetch(false);
    });

    it("실패 toast가 표시된다", async () => {
      renderWithProviders(<JoinAppointmentForm appointmentId="appt-1" />);

      await fillName(user);
      await user.click(screen.getByRole("button", { name: "약속 함께하기" }));

      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith({
          message:
            "약속방을 참여하는 과정에서 문제가 생겼습니다. 잠시후 다시 시도해주세요.",
        }),
      );
    });

    it("실패 시 router.push는 호출되지 않는다", async () => {
      renderWithProviders(<JoinAppointmentForm appointmentId="appt-1" />);

      await fillName(user);
      await user.click(screen.getByRole("button", { name: "약속 함께하기" }));

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
