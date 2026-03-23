import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils/render";
import ViewUserVoteCalendar from "./ViewUserVoteCalendar";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const mockUseDateVoteStatusByUserQuery = jest.fn();
jest.mock("../hooks/useDateVoteStatusByUserQuery", () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseDateVoteStatusByUserQuery(...args),
}));

// ViewCalendarShell: 4개의 날짜에 대해 renderCell을 호출한다
// - Apr 15: 기본 설정에서 POSSIBLE
// - Apr 20: 기본 설정에서 UNCERTAIN
// - Apr 25: 기본 설정에서 IMPOSSIBLE
// - Mar 31: isOutsideMonth = true (달 외부)
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
      {renderCell({
        date: new Date("2026-04-25"),
        isOutsideMonth: false,
        isDisabled: false,
      })}
      {renderCell({
        date: new Date("2026-03-31"),
        isOutsideMonth: true,
        isDisabled: false,
      })}
    </div>
  ),
}));

jest.mock("./VoteStatusByDateModal", () => ({
  __esModule: true,
  default: () => <div data-testid="vote-status-by-date-modal" />,
}));

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

let user: ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  user = userEvent.setup();
  mockUseDateVoteStatusByUserQuery.mockReturnValue({
    data: {
      possibleList: ["2026-04-15"],
      ambList: ["2026-04-20"],
    },
  });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ViewUserVoteCalendar", () => {
  describe("날짜 클릭", () => {
    it("가능(POSSIBLE) 날짜를 클릭하면 투표 현황 모달이 열린다", async () => {
      // Given
      renderWithProviders(<ViewUserVoteCalendar appointmentId="appt-1" userId={2} />);

      // When
      await user.click(screen.getByText("15"));

      // Then
      expect(screen.getByTestId("vote-status-by-date-modal")).toBeInTheDocument();
    });

    it("애매(UNCERTAIN) 날짜를 클릭하면 투표 현황 모달이 열린다", async () => {
      // Given
      renderWithProviders(<ViewUserVoteCalendar appointmentId="appt-1" userId={2} />);

      // When
      await user.click(screen.getByText("20"));

      // Then
      expect(screen.getByTestId("vote-status-by-date-modal")).toBeInTheDocument();
    });

    it("불가능(IMPOSSIBLE) 날짜를 클릭해도 모달이 열리지 않는다", async () => {
      // Given — Apr 25 is not in possibleList or ambList → IMPOSSIBLE
      renderWithProviders(<ViewUserVoteCalendar appointmentId="appt-1" userId={2} />);

      // When
      await user.click(screen.getByText("25"));

      // Then
      expect(screen.queryByTestId("vote-status-by-date-modal")).not.toBeInTheDocument();
    });

    it("달 바깥 날짜는 POSSIBLE이어도 모달이 열리지 않는다", async () => {
      // Given — Mar 31 is isOutsideMonth=true; even though it's in possibleList, clickable=false
      mockUseDateVoteStatusByUserQuery.mockReturnValue({
        data: {
          possibleList: ["2026-03-31"],
          ambList: [],
        },
      });
      renderWithProviders(<ViewUserVoteCalendar appointmentId="appt-1" userId={2} />);

      // When
      await user.click(screen.getByText("31"));

      // Then
      expect(screen.queryByTestId("vote-status-by-date-modal")).not.toBeInTheDocument();
    });
  });
});
