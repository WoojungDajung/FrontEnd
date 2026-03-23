import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils/render";
import VoteDateForm from "./VoteDateForm";

// ---------------------------------------------------------------------------
// Module mocks (외부 경계만 mock)
// ---------------------------------------------------------------------------

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

const mockSendGTM = jest.fn();
jest.mock("@/src/shared/lib/googleTagManager/sendGTM", () => ({
  sendGTM: (...args: unknown[]) => mockSendGTM(...args),
}));

// ---------------------------------------------------------------------------
// 날짜 고정
// VoteDateForm이 내부에서 addDays(new Date(), 1)을 startDate로 사용하므로
// 현재 날짜를 고정해 캘린더 셀이 테스트마다 동일하게 렌더링되도록 한다.
//
// 2026-03-01 기준:
//   startDate = 2026-03-02 (내일)
//   March 2026 달력 표시, 3월 2일부터 클릭 가능
//   안전하게 클릭 가능한 셀: 5, 10, 15 (월/화/일 → 앞월·다음월 그리드 중복 없음)
// ---------------------------------------------------------------------------

beforeAll(() => {
  jest.useFakeTimers({ now: new Date("2026-03-01").getTime() });
});

afterAll(() => {
  jest.useRealTimers();
});

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

const EMPTY_INITIAL: object = {
  status_code: 200,
  data: { possibleList: [], ambList: [] },
};

const VOTE_SUCCESS: object = { status_code: 200, data: {} };

function setupFetch({
  initialData = EMPTY_INITIAL,
  voteOk = true,
}: {
  initialData?: object;
  voteOk?: boolean;
} = {}) {
  mockFetch.mockImplementation((url: string) => {
    // GET: 사용자별 날짜 투표 현황
    if (url.includes("/date/appt-1/1")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(initialData),
      });
    }
    // POST: 날짜 투표 제출
    if (voteOk) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(VOTE_SUCCESS),
      });
    }
    return Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ status_code: 500, message: "서버 오류" }),
    });
  });
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const DEFAULT_PROPS = {
  appointmentId: "appt-1",
  userId: 1,
  isHost: true,
  onSubmit: jest.fn(),
};

// ---------------------------------------------------------------------------
// 테스트
// ---------------------------------------------------------------------------

describe("VoteDateForm 통합", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    // fake timers 환경에서 userEvent가 내부 setTimeout을 처리할 수 있도록 advanceTimers 설정
    user = userEvent.setup({
      advanceTimers: (ms) => jest.advanceTimersByTime(ms),
    });
    setupFetch();
  });

  // 초기 데이터 fetch 완료를 기다리는 헬퍼
  async function waitForInitialLoad() {
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/date/appt-1/1"),
        expect.anything(),
      ),
    );
  }

  describe("캘린더 날짜 선택", () => {
    it("날짜 셀을 클릭하면 impossible → possible 상태가 된다", async () => {
      renderWithProviders(<VoteDateForm {...DEFAULT_PROPS} />);
      await waitForInitialLoad();

      const cell = screen.getByRole("button", { name: "5" });
      expect(cell).not.toBeDisabled();
      await user.click(cell);

      expect(cell).toHaveClass("bg-primary-400");
    });

    it("같은 셀을 두 번 클릭하면 possible → uncertain 상태가 된다", async () => {
      renderWithProviders(<VoteDateForm {...DEFAULT_PROPS} />);
      await waitForInitialLoad();

      const cell = screen.getByRole("button", { name: "5" });
      await user.click(cell); // impossible → possible
      await user.click(cell); // possible → uncertain

      expect(cell).toHaveClass("bg-gray-300");
    });

    it("세 번 클릭하면 uncertain → impossible로 원상 복귀된다", async () => {
      renderWithProviders(<VoteDateForm {...DEFAULT_PROPS} />);
      await waitForInitialLoad();

      const cell = screen.getByRole("button", { name: "5" });
      await user.click(cell); // impossible → possible
      await user.click(cell); // possible → uncertain
      await user.click(cell); // uncertain → impossible

      expect(cell).not.toHaveClass("bg-primary-400");
      expect(cell).not.toHaveClass("bg-gray-300");
    });

    it("startDate 이전 셀(3월 1일)은 비활성화된다", async () => {
      renderWithProviders(<VoteDateForm {...DEFAULT_PROPS} />);
      await waitForInitialLoad();

      // 3월 그리드에는 뒷달 보정 셀(4월 1일)도 포함되므로 "1" 버튼이 두 개 존재한다.
      // 그리드 순서상 첫 번째가 3월 1일이며, startDate(3월 2일) 이전이므로 disabled여야 한다.
      const [march1] = screen.getAllByRole("button", { name: "1" });
      expect(march1).toBeDisabled();
    });
  });

  describe("초기 투표 데이터 복원", () => {
    it("서버 데이터의 possible 날짜가 possible 상태로 표시된다", async () => {
      setupFetch({
        initialData: {
          status_code: 200,
          data: { possibleList: ["2026-03-05"], ambList: [] },
        },
      });
      renderWithProviders(<VoteDateForm {...DEFAULT_PROPS} />);

      await waitFor(() =>
        expect(screen.getByRole("button", { name: "5" })).toHaveClass(
          "bg-primary-400",
        ),
      );
    });

    it("서버 데이터의 uncertain 날짜가 uncertain 상태로 표시된다", async () => {
      setupFetch({
        initialData: {
          status_code: 200,
          data: { possibleList: [], ambList: ["2026-03-10"] },
        },
      });
      renderWithProviders(<VoteDateForm {...DEFAULT_PROPS} />);

      await waitFor(() =>
        expect(screen.getByRole("button", { name: "10" })).toHaveClass(
          "bg-gray-300",
        ),
      );
    });

    it("초기 상태에서 변경 없이 저장 시 API 페이로드에 변경 항목이 없다", async () => {
      setupFetch({
        initialData: {
          status_code: 200,
          data: { possibleList: ["2026-03-05"], ambList: [] },
        },
      });
      renderWithProviders(<VoteDateForm {...DEFAULT_PROPS} />);
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "5" })).toHaveClass(
          "bg-primary-400",
        ),
      );

      await user.click(screen.getByRole("button", { name: "저장하기" }));

      await waitFor(() => {
        const postCall = mockFetch.mock.calls.find((call) =>
          (call[0] as string).includes("vote"),
        );
        const body = JSON.parse(
          (postCall?.[1] as RequestInit).body as string,
        );
        // POSSIBLE→POSSIBLE 는 변경 없음 → dateList 비어있어야 함
        expect(body.dateList).toHaveLength(0);
      });
    });
  });

  describe("저장하기 — confirm 확인", () => {
    it("투표 API가 호출된다", async () => {
      renderWithProviders(<VoteDateForm {...DEFAULT_PROPS} />);
      await waitForInitialLoad();

      await user.click(screen.getByRole("button", { name: "5" }));
      await user.click(screen.getByRole("button", { name: "저장하기" }));

      await waitFor(() =>
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("vote"),
          expect.anything(),
        ),
      );
    });

    it("'투표가 완료됐어요.' toast가 표시된다", async () => {
      renderWithProviders(<VoteDateForm {...DEFAULT_PROPS} />);
      await waitForInitialLoad();

      await user.click(screen.getByRole("button", { name: "저장하기" }));

      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith({ message: "투표가 완료됐어요." }),
      );
    });

    it("onSubmit prop이 호출된다", async () => {
      const onSubmit = jest.fn();
      renderWithProviders(<VoteDateForm {...DEFAULT_PROPS} onSubmit={onSubmit} />);
      await waitForInitialLoad();

      await user.click(screen.getByRole("button", { name: "저장하기" }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    });

    it("GTM submit_vote(schedule) 이벤트가 전송된다", async () => {
      renderWithProviders(<VoteDateForm {...DEFAULT_PROPS} />);
      await waitForInitialLoad();

      await user.click(screen.getByRole("button", { name: "저장하기" }));

      await waitFor(() =>
        expect(mockSendGTM).toHaveBeenCalledWith(
          expect.objectContaining({
            event: "submit_vote",
            vote_type: "schedule",
            appointment_id: "appt-1",
          }),
        ),
      );
    });

    it("GTM save_date 이벤트에 possible_count·maybe_count가 포함된다", async () => {
      renderWithProviders(<VoteDateForm {...DEFAULT_PROPS} />);
      await waitForInitialLoad();

      await user.click(screen.getByRole("button", { name: "5" })); // possible +1
      await user.click(screen.getByRole("button", { name: "10" })); // possible +1
      await user.click(screen.getByRole("button", { name: "10" })); // → uncertain +1
      await user.click(screen.getByRole("button", { name: "저장하기" }));

      await waitFor(() =>
        expect(mockSendGTM).toHaveBeenCalledWith(
          expect.objectContaining({
            event: "save_date",
            possible_count: 1,
            maybe_count: 1,
          }),
        ),
      );
    });

    it("isHost=false이면 GTM user_role: 'guest'가 포함된다", async () => {
      renderWithProviders(
        <VoteDateForm {...DEFAULT_PROPS} isHost={false} />,
      );
      await waitForInitialLoad();

      await user.click(screen.getByRole("button", { name: "저장하기" }));

      await waitFor(() =>
        expect(mockSendGTM).toHaveBeenCalledWith(
          expect.objectContaining({ user_role: "guest" }),
        ),
      );
    });
  });

  describe("저장하기 — confirm 취소", () => {
    it("confirm 취소 시 투표 API가 호출되지 않는다", async () => {
      mockConfirm.mockResolvedValue(false);
      renderWithProviders(<VoteDateForm {...DEFAULT_PROPS} />);
      await waitForInitialLoad();

      const callCountBefore = mockFetch.mock.calls.length;
      await user.click(screen.getByRole("button", { name: "저장하기" }));

      await waitFor(() => expect(mockConfirm).toHaveBeenCalled());
      expect(mockFetch.mock.calls.length).toBe(callCountBefore);
    });
  });

  describe("저장 실패", () => {
    beforeEach(() => {
      setupFetch({ voteOk: false });
    });

    it("'투표에 실패했습니다.' toast가 표시된다", async () => {
      renderWithProviders(<VoteDateForm {...DEFAULT_PROPS} />);
      await waitForInitialLoad();

      await user.click(screen.getByRole("button", { name: "저장하기" }));

      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith({
          message: "투표에 실패했습니다. 잠시 후 다시 시도해주세요.",
        }),
      );
    });

    it("GTM 이벤트는 전송되지 않는다", async () => {
      renderWithProviders(<VoteDateForm {...DEFAULT_PROPS} />);
      await waitForInitialLoad();

      await user.click(screen.getByRole("button", { name: "저장하기" }));

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockSendGTM).not.toHaveBeenCalled();
    });
  });
});
