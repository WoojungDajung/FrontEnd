import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils/render";
import VoteCalendar from "./VoteCalendar";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const START_DATE = new Date("2026-04-01");
const EMPTY_VALUE = {
  possible: new Set<string>(),
  uncertain: new Set<string>(),
};

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

let user: ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  user = userEvent.setup();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("VoteCalendar", () => {
  describe("헤더", () => {
    it("현재 월이 표시된다", () => {
      renderWithProviders(<VoteCalendar startDate={START_DATE} value={EMPTY_VALUE} />);

      expect(screen.getByText("2026년 4월")).toBeInTheDocument();
    });

    it("시작 월에서는 이전 달 버튼이 비활성화된다", () => {
      renderWithProviders(<VoteCalendar startDate={START_DATE} value={EMPTY_VALUE} />);

      expect(screen.getByRole("button", { name: "이전 달" })).toBeDisabled();
    });

    it("다음 달 버튼을 클릭하면 다음 달로 이동한다", async () => {
      renderWithProviders(<VoteCalendar startDate={START_DATE} value={EMPTY_VALUE} />);

      await user.click(screen.getByRole("button", { name: "다음 달" }));

      expect(screen.getByText("2026년 5월")).toBeInTheDocument();
    });

    it("다음 달로 이동하면 이전 달 버튼이 활성화된다", async () => {
      renderWithProviders(<VoteCalendar startDate={START_DATE} value={EMPTY_VALUE} />);

      await user.click(screen.getByRole("button", { name: "다음 달" }));

      expect(screen.getByRole("button", { name: "이전 달" })).toBeEnabled();
    });
  });

  describe("날짜 클릭", () => {
    it("불가능 상태의 날짜를 클릭하면 가능으로 전환된다", async () => {
      // Given — April 15 is not in possible/uncertain → state is "impossible"
      const onChange = jest.fn();
      renderWithProviders(
        <VoteCalendar startDate={START_DATE} value={EMPTY_VALUE} onChange={onChange} />,
      );

      // When — April 15 appears once in the April grid
      await user.click(screen.getByRole("button", { name: "15" }));

      // Then
      expect(onChange).toHaveBeenCalledWith(expect.any(Date), "impossible", "possible");
    });

    it("가능 상태의 날짜를 클릭하면 애매로 전환된다", async () => {
      // Given
      const onChange = jest.fn();
      renderWithProviders(
        <VoteCalendar
          startDate={START_DATE}
          value={{ possible: new Set(["2026-04-15"]), uncertain: new Set() }}
          onChange={onChange}
        />,
      );

      // When
      await user.click(screen.getByRole("button", { name: "15" }));

      // Then
      expect(onChange).toHaveBeenCalledWith(expect.any(Date), "possible", "uncertain");
    });

    it("애매 상태의 날짜를 클릭하면 불가능으로 전환된다", async () => {
      // Given
      const onChange = jest.fn();
      renderWithProviders(
        <VoteCalendar
          startDate={START_DATE}
          value={{ possible: new Set(), uncertain: new Set(["2026-04-15"]) }}
          onChange={onChange}
        />,
      );

      // When
      await user.click(screen.getByRole("button", { name: "15" }));

      // Then
      expect(onChange).toHaveBeenCalledWith(expect.any(Date), "uncertain", "impossible");
    });

    it("시작일 이전 날짜는 클릭할 수 없다", () => {
      // Given — startDate = Apr 15, so Apr 3 is before startDate → disabled
      renderWithProviders(
        <VoteCalendar startDate={new Date("2026-04-15")} value={EMPTY_VALUE} />,
      );

      // Then — April 3 appears only once in April 2026 grid (no overflow from March)
      expect(screen.getByRole("button", { name: "3" })).toBeDisabled();
    });
  });
});
