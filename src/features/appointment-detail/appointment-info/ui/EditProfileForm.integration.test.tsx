import React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils/render";
import EditProfileForm from "./EditProfileForm";

// ---------------------------------------------------------------------------
// Module mocks (외부 경계만 mock)
// ---------------------------------------------------------------------------

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
    value: unknown;
    onChange: (v: { address: string; placeName?: string }) => void;
    inputId?: string;
    placeholder?: string;
  }) => (
    <button
      type="button"
      aria-label="주소 검색"
      onClick={() => onChange({ address: "서울 강서구 마곡동로 161" })}
    >
      주소 검색
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
// global.fetch를 직접 mock해서 네트워크 경계를 차단한다.
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
  mockFetch.mockImplementation((url: string) => {
    // 주소 → 좌표 변환 API (출발 장소 변경 시 호출)
    if (url.includes("kakao")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ latitude: "37.123", longitude: "127.456" }),
      });
    }
    // updateMemberProfile API
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ status_code: 200, data: {} }),
    });
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

const DEFAULT_PROFILE = {
  id: 1,
  memberNickName: "테스트유저",
  startingPlace: null,
};

const DEFAULT_PROPS = {
  appointmentId: "appt-1",
  initialProfile: DEFAULT_PROFILE,
};

// ---------------------------------------------------------------------------
// 헬퍼
// ---------------------------------------------------------------------------

/** 이름 필드를 변경해 버튼이 활성화될 때까지 대기 */
async function changeName(newName = "수정된이름") {
  fireEvent.change(screen.getByDisplayValue(DEFAULT_PROFILE.memberNickName), {
    target: { value: newName },
  });
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "저장하기" })).toBeEnabled(),
  );
}

// ---------------------------------------------------------------------------
// 테스트
// ---------------------------------------------------------------------------

describe("EditProfileForm 통합", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe("폼 유효성 검사", () => {
    it("초기 상태에서 저장 버튼이 비활성화된다", () => {
      renderWithProviders(<EditProfileForm {...DEFAULT_PROPS} />);

      expect(screen.getByRole("button", { name: "저장하기" })).toBeDisabled();
    });

    it("이름을 변경하면 저장 버튼이 활성화된다", async () => {
      renderWithProviders(<EditProfileForm {...DEFAULT_PROPS} />);

      await changeName();
    });

    it("주소를 변경하면 저장 버튼이 활성화된다", async () => {
      renderWithProviders(<EditProfileForm {...DEFAULT_PROPS} />);

      await user.click(screen.getByRole("button", { name: "주소 검색" }));

      await waitFor(() =>
        expect(screen.getByRole("button", { name: "저장하기" })).toBeEnabled(),
      );
    });

    it("이름을 모두 지우면 저장 버튼이 비활성화된다", async () => {
      renderWithProviders(<EditProfileForm {...DEFAULT_PROPS} />);

      // user.clear()는 keyboard 시뮬레이션으로 RHF re-validation이 동시에 실행되지
      // 않을 수 있으므로 fireEvent.change로 직접 동기 호출한다.
      fireEvent.change(screen.getByDisplayValue(DEFAULT_PROFILE.memberNickName), {
        target: { value: "" },
      });

      await waitFor(() =>
        expect(screen.getByRole("button", { name: "저장하기" })).toBeDisabled(),
      );
    });
  });

  describe("저장 성공", () => {
    beforeEach(() => {
      mockFetchSuccess();
    });

    it("저장 성공 시 '저장이 완료됐어요.' toast가 표시된다", async () => {
      renderWithProviders(<EditProfileForm {...DEFAULT_PROPS} />);

      await changeName();
      await user.click(screen.getByRole("button", { name: "저장하기" }));

      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith({ message: "저장이 완료됐어요." }),
      );
    });

    it("저장 성공 후 스피너가 닫히면 onSubmitSuccess prop이 호출된다", async () => {
      const onSubmitSuccess = jest.fn();
      renderWithProviders(
        <EditProfileForm {...DEFAULT_PROPS} onSubmitSuccess={onSubmitSuccess} />,
      );

      await changeName();
      await user.click(screen.getByRole("button", { name: "저장하기" }));

      await waitFor(() =>
        expect(screen.getByTestId("loading-spinner")).toBeInTheDocument(),
      );
      await user.click(screen.getByRole("button", { name: "스피너 닫기" }));

      expect(onSubmitSuccess).toHaveBeenCalledTimes(1);
    });

    it("주소를 변경 후 저장하면 좌표 변환 API가 함께 호출된다", async () => {
      renderWithProviders(<EditProfileForm {...DEFAULT_PROPS} />);

      await user.click(screen.getByRole("button", { name: "주소 검색" }));
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "저장하기" })).toBeEnabled(),
      );
      await user.click(screen.getByRole("button", { name: "저장하기" }));

      await waitFor(() =>
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("kakao"),
        ),
      );
    });
  });

  describe("저장 실패", () => {
    beforeEach(() => {
      mockFetchError();
    });

    it("저장 실패 시 '저장에 실패했어요.' toast가 표시된다", async () => {
      renderWithProviders(<EditProfileForm {...DEFAULT_PROPS} />);

      await changeName();
      await user.click(screen.getByRole("button", { name: "저장하기" }));

      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith({
          message: "저장에 실패했어요. 잠시후 다시 시도해주세요.",
        }),
      );
    });

    it("저장 실패 시 onSubmitSuccess는 호출되지 않는다", async () => {
      const onSubmitSuccess = jest.fn();
      renderWithProviders(
        <EditProfileForm {...DEFAULT_PROPS} onSubmitSuccess={onSubmitSuccess} />,
      );

      await changeName();
      await user.click(screen.getByRole("button", { name: "저장하기" }));

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(onSubmitSuccess).not.toHaveBeenCalled();
    });
  });
});
