import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils/render";
import ViewTotalVoteCalendar from "./ViewTotalVoteCalendar";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const mockUseDateVoteStatusByMonthQuery = jest.fn();
jest.mock("../hooks/useDateVoteStatusByMonthQuery", () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseDateVoteStatusByMonthQuery(...args),
  getDateVoteStatusByMonthQueryOptions: jest.fn().mockReturnValue({}),
}));

const mockPrefetchQuery = jest.fn().mockResolvedValue(undefined);
jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQueryClient: () => ({ prefetchQuery: mockPrefetchQuery }),
}));

// ViewCalendarShell: renderCell을 두 날짜에 대해 호출하는 최소 mock
// - Apr 15: votePercentage > 0으로 설정 가능 (clickable)
// - Apr 20: votePercentage = 0 (not clickable)
jest.mock("./ViewCalendarShell", () => ({
  __esModule: true,
  default: ({
    renderCell,
  }: {
    renderCell: (meta: {
      date: Date;
      isOutsideMonth: boolean;
      isDisabled: boolean;
    }) => React.ReactNode;
  }) => (
    <div data-testid="calendar-shell">
      {renderCell({
        date: new Date("2026-04-15"),
        isOutsideMonth: false,
        isDisabled: false,
      })}
      {renderCell({
        date: new Date("2026-04-20"),
        isOutsideMonth: false,
        isDisabled: false,
      })}
    </div>
  ),
}));

jest.mock("./VoteStatusByDateModal", () => ({
  __esModule: true,
  default: () => <div data-testid="vote-status-by-date-modal" />,
}));

jest.mock("@/src/shared/ui/LoadingSpinner", () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="loading-spinner" /> : null,
}));

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

let user: ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  user = userEvent.setup();
  mockUseDateVoteStatusByMonthQuery.mockReturnValue({
    data: { dateList: [] },
    isFetching: false,
  });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ViewTotalVoteCalendar", () => {
  describe("렌더링", () => {
    it("캘린더가 표시된다", () => {
      renderWithProviders(<ViewTotalVoteCalendar appointmentId="appt-1" />);

      expect(screen.getByTestId("calendar-shell")).toBeInTheDocument();
    });
  });

  describe("로딩 상태", () => {
    it("isFetching이 true이면 LoadingSpinner가 표시된다", () => {
      // Given
      mockUseDateVoteStatusByMonthQuery.mockReturnValue({
        data: null,
        isFetching: true,
      });

      // When
      renderWithProviders(<ViewTotalVoteCalendar appointmentId="appt-1" />);

      // Then
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    it("isFetching이 false이면 LoadingSpinner가 표시되지 않는다", () => {
      // Given / When
      renderWithProviders(<ViewTotalVoteCalendar appointmentId="appt-1" />);

      // Then
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });
  });

  describe("날짜 클릭", () => {
    it("투표율이 있는 날짜를 클릭하면 투표 현황 모달이 열린다", async () => {
      // Given — Apr 15 has percentage=80
      mockUseDateVoteStatusByMonthQuery.mockReturnValue({
        data: { dateList: [{ ymd: "2026-04-15", percentage: "80" }] },
        isFetching: false,
      });
      renderWithProviders(<ViewTotalVoteCalendar appointmentId="appt-1" />);

      // When
      await user.click(screen.getByText("15"));

      // Then
      expect(screen.getByTestId("vote-status-by-date-modal")).toBeInTheDocument();
    });

    it("투표율이 없는 날짜를 클릭해도 모달이 열리지 않는다", async () => {
      // Given — Apr 20 has no data → votePercentage = 0
      mockUseDateVoteStatusByMonthQuery.mockReturnValue({
        data: { dateList: [{ ymd: "2026-04-15", percentage: "80" }] },
        isFetching: false,
      });
      renderWithProviders(<ViewTotalVoteCalendar appointmentId="appt-1" />);

      // When
      await user.click(screen.getByText("20"));

      // Then
      expect(screen.queryByTestId("vote-status-by-date-modal")).not.toBeInTheDocument();
    });
  });
});
