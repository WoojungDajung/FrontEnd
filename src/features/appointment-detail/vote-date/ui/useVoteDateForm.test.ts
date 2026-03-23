import { renderHook, act } from "@testing-library/react";
import useVoteDateForm from "./useVoteDateForm";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const mockUseDateVoteStatusByUserQuery = jest.fn();
jest.mock("../hooks/useDateVoteStatusByUserQuery", () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseDateVoteStatusByUserQuery(...args),
}));

const mockMutate = jest.fn();
const mockReset = jest.fn();
const mockUseVoteDate = jest.fn();
jest.mock("../hooks/useVoteDate", () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseVoteDate(...args),
}));

const mockSendGTM = jest.fn();
jest.mock("@/src/shared/lib/googleTagManager/sendGTM", () => ({
  sendGTM: (...args: unknown[]) => mockSendGTM(...args),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const DEFAULT_PROPS = {
  appointmentId: "appt-1",
  userId: 1,
  isHost: false,
};

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockUseDateVoteStatusByUserQuery.mockReturnValue({ data: undefined });
  mockUseVoteDate.mockReturnValue({
    mutate: mockMutate,
    reset: mockReset,
    isPending: false,
    isSuccess: false,
  });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useVoteDateForm", () => {
  describe("초기 상태", () => {
    it("status.possible과 status.uncertain이 빈 Set이다", () => {
      const { result } = renderHook(() => useVoteDateForm(DEFAULT_PROPS));

      expect(result.current.status.possible.size).toBe(0);
      expect(result.current.status.uncertain.size).toBe(0);
    });
  });

  describe("쿼리 데이터 초기화", () => {
    it("쿼리 데이터가 있으면 status를 초기화한다", () => {
      // Given
      mockUseDateVoteStatusByUserQuery.mockReturnValue({
        data: {
          possibleList: ["2026-04-15"],
          ambList: ["2026-04-20"],
        },
      });

      // When
      const { result } = renderHook(() => useVoteDateForm(DEFAULT_PROPS));

      // Then
      expect(result.current.status.possible.has("2026-04-15")).toBe(true);
      expect(result.current.status.uncertain.has("2026-04-20")).toBe(true);
    });
  });

  describe("onChange 상태 전환", () => {
    it("불가능 → 가능으로 전환된다", () => {
      const { result } = renderHook(() => useVoteDateForm(DEFAULT_PROPS));

      act(() => {
        result.current.onChange(new Date("2026-04-15"), "impossible", "possible");
      });

      expect(result.current.status.possible.has("2026-04-15")).toBe(true);
    });

    it("가능 → 애매로 전환된다", () => {
      // Given — 2026-04-15가 possible로 초기화된 상태
      mockUseDateVoteStatusByUserQuery.mockReturnValue({
        data: { possibleList: ["2026-04-15"], ambList: [] },
      });
      const { result } = renderHook(() => useVoteDateForm(DEFAULT_PROPS));

      // When
      act(() => {
        result.current.onChange(new Date("2026-04-15"), "possible", "uncertain");
      });

      // Then
      expect(result.current.status.possible.has("2026-04-15")).toBe(false);
      expect(result.current.status.uncertain.has("2026-04-15")).toBe(true);
    });

    it("애매 → 불가능으로 전환된다", () => {
      // Given
      mockUseDateVoteStatusByUserQuery.mockReturnValue({
        data: { possibleList: [], ambList: ["2026-04-15"] },
      });
      const { result } = renderHook(() => useVoteDateForm(DEFAULT_PROPS));

      // When
      act(() => {
        result.current.onChange(new Date("2026-04-15"), "uncertain", "impossible");
      });

      // Then
      expect(result.current.status.possible.has("2026-04-15")).toBe(false);
      expect(result.current.status.uncertain.has("2026-04-15")).toBe(false);
    });
  });

  describe("submitForm 성공 시", () => {
    beforeEach(() => {
      mockMutate.mockImplementation(
        (_data: unknown, { onSuccess }: { onSuccess: () => void }) => {
          onSuccess();
        },
      );
    });

    it("submit_vote GTM 이벤트를 전송한다", () => {
      const { result } = renderHook(() => useVoteDateForm(DEFAULT_PROPS));

      act(() => {
        result.current.submitForm();
      });

      expect(mockSendGTM).toHaveBeenCalledWith(
        expect.objectContaining({ event: "submit_vote" }),
      );
    });

    it("save_date GTM 이벤트를 전송한다", () => {
      const { result } = renderHook(() => useVoteDateForm(DEFAULT_PROPS));

      act(() => {
        result.current.submitForm();
      });

      expect(mockSendGTM).toHaveBeenCalledWith(
        expect.objectContaining({ event: "save_date" }),
      );
    });

    it("GTM 이벤트가 2번 전송된다", () => {
      const { result } = renderHook(() => useVoteDateForm(DEFAULT_PROPS));

      act(() => {
        result.current.submitForm();
      });

      expect(mockSendGTM).toHaveBeenCalledTimes(2);
    });

    it("onSubmitSuccess 콜백이 호출된다", () => {
      const onSubmitSuccess = jest.fn();
      const { result } = renderHook(() => useVoteDateForm(DEFAULT_PROPS));

      act(() => {
        result.current.submitForm({ onSubmitSuccess });
      });

      expect(onSubmitSuccess).toHaveBeenCalledTimes(1);
    });
  });

  describe("submitForm 실패 시", () => {
    beforeEach(() => {
      mockMutate.mockImplementation(
        (_data: unknown, { onError }: { onError: () => void }) => {
          onError();
        },
      );
    });

    it("reset이 호출된다", () => {
      const { result } = renderHook(() => useVoteDateForm(DEFAULT_PROPS));

      act(() => {
        result.current.submitForm();
      });

      expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it("onSubmitError 콜백이 호출된다", () => {
      const onSubmitError = jest.fn();
      const { result } = renderHook(() => useVoteDateForm(DEFAULT_PROPS));

      act(() => {
        result.current.submitForm({ onSubmitError });
      });

      expect(onSubmitError).toHaveBeenCalledTimes(1);
    });

    it("GTM 이벤트는 전송되지 않는다", () => {
      const { result } = renderHook(() => useVoteDateForm(DEFAULT_PROPS));

      act(() => {
        result.current.submitForm();
      });

      expect(mockSendGTM).not.toHaveBeenCalled();
    });
  });
});
