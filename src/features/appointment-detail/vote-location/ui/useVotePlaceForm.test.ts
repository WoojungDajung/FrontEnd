import { renderHook, act } from "@testing-library/react";
import useVotePlaceForm from "./useVotePlaceForm";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const mockMutate = jest.fn();
const mockReset = jest.fn();
const mockUseVoteLocation = jest.fn();
jest.mock("../hooks/useVoteLocation", () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseVoteLocation(...args),
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
  myVotedPlaceIdList: [] as number[],
  isHost: false,
};

const PLACE = {
  id: 1,
  name: "강남역",
  address: "서울 강남구",
  voteCount: "3",
  percentage: "60",
};

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockUseVoteLocation.mockReturnValue({
    mutate: mockMutate,
    reset: mockReset,
    isPending: false,
    isSuccess: false,
  });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useVotePlaceForm", () => {
  describe("초기 선택 상태", () => {
    it("myVotedPlaceIdList로 초기화된다", () => {
      const { result } = renderHook(() =>
        useVotePlaceForm({ ...DEFAULT_PROPS, myVotedPlaceIdList: [1, 2] }),
      );

      const { isVoted: isPlace1Voted } = result.current.getPlaceItemStatus({
        ...PLACE,
        id: 1,
      });
      const { isVoted: isPlace2Voted } = result.current.getPlaceItemStatus({
        ...PLACE,
        id: 2,
      });
      expect(isPlace1Voted).toBe(true);
      expect(isPlace2Voted).toBe(true);
    });
  });

  describe("selectPlace 토글", () => {
    it("선택되지 않은 장소를 선택하면 isVoted가 true가 된다", () => {
      const { result } = renderHook(() => useVotePlaceForm(DEFAULT_PROPS));

      act(() => {
        result.current.selectPlace(1);
      });

      expect(result.current.getPlaceItemStatus(PLACE).isVoted).toBe(true);
    });

    it("이미 선택된 장소를 다시 누르면 isVoted가 false가 된다", () => {
      const { result } = renderHook(() =>
        useVotePlaceForm({ ...DEFAULT_PROPS, myVotedPlaceIdList: [1] }),
      );

      act(() => {
        result.current.selectPlace(1);
      });

      expect(result.current.getPlaceItemStatus(PLACE).isVoted).toBe(false);
    });
  });

  describe("getPlaceItemStatus 투표 수 계산", () => {
    it("원래 투표하지 않았고 현재도 미선택이면 voteCount는 초기값 그대로다", () => {
      // Given — myVotedPlaceIdList = [], 현재 미선택
      const { result } = renderHook(() => useVotePlaceForm(DEFAULT_PROPS));

      // Then
      expect(result.current.getPlaceItemStatus(PLACE).voteCount).toBe(
        Number(PLACE.voteCount),
      );
    });

    it("원래 투표하지 않았고 현재 선택하면 voteCount가 1 증가한다", () => {
      // Given
      const { result } = renderHook(() => useVotePlaceForm(DEFAULT_PROPS));

      // When
      act(() => {
        result.current.selectPlace(1);
      });

      // Then
      expect(result.current.getPlaceItemStatus(PLACE).voteCount).toBe(
        Number(PLACE.voteCount) + 1,
      );
    });

    it("원래 투표했고 현재 취소하면 voteCount가 1 감소한다", () => {
      // Given — myVotedPlaceIdList = [1], 현재 선택 취소
      const { result } = renderHook(() =>
        useVotePlaceForm({ ...DEFAULT_PROPS, myVotedPlaceIdList: [1] }),
      );

      // When
      act(() => {
        result.current.selectPlace(1); // 취소
      });

      // Then
      expect(result.current.getPlaceItemStatus(PLACE).voteCount).toBe(
        Number(PLACE.voteCount) - 1,
      );
    });

    it("원래 투표했고 현재도 선택 상태이면 voteCount는 초기값 그대로다", () => {
      // Given — myVotedPlaceIdList = [1], 변경 없음
      const { result } = renderHook(() =>
        useVotePlaceForm({ ...DEFAULT_PROPS, myVotedPlaceIdList: [1] }),
      );

      // Then (서버 voteCount에 이미 내 투표가 포함됨 → +1 -1 = 변화 없음)
      expect(result.current.getPlaceItemStatus(PLACE).voteCount).toBe(
        Number(PLACE.voteCount),
      );
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
      const { result } = renderHook(() => useVotePlaceForm(DEFAULT_PROPS));

      act(() => {
        result.current.submitForm();
      });

      expect(mockSendGTM).toHaveBeenCalledWith(
        expect.objectContaining({ event: "submit_vote", vote_type: "place" }),
      );
    });

    it("isHost에 따라 user_role이 설정된다", () => {
      const { result } = renderHook(() =>
        useVotePlaceForm({ ...DEFAULT_PROPS, isHost: true }),
      );

      act(() => {
        result.current.submitForm();
      });

      expect(mockSendGTM).toHaveBeenCalledWith(
        expect.objectContaining({ user_role: "host" }),
      );
    });

    it("onSubmitSuccess 콜백이 호출된다", () => {
      const onSubmitSuccess = jest.fn();
      const { result } = renderHook(() => useVotePlaceForm(DEFAULT_PROPS));

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
      const { result } = renderHook(() => useVotePlaceForm(DEFAULT_PROPS));

      act(() => {
        result.current.submitForm();
      });

      expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it("onSubmitError 콜백이 호출된다", () => {
      const onSubmitError = jest.fn();
      const { result } = renderHook(() => useVotePlaceForm(DEFAULT_PROPS));

      act(() => {
        result.current.submitForm({ onSubmitError });
      });

      expect(onSubmitError).toHaveBeenCalledTimes(1);
    });

    it("GTM 이벤트는 전송되지 않는다", () => {
      const { result } = renderHook(() => useVotePlaceForm(DEFAULT_PROPS));

      act(() => {
        result.current.submitForm();
      });

      expect(mockSendGTM).not.toHaveBeenCalled();
    });
  });
});
