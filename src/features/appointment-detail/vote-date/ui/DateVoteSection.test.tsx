import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils/render";
import DateVoteSection from "./DateVoteSection";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const mockSelectParticipant = jest.fn();
const mockUseAppointmentPage = jest.fn();
jest.mock(
  "@/src/features/appointment-detail/context/AppointmentContext",
  () => ({
    useAppointmentPage: () => mockUseAppointmentPage(),
  }),
);

const mockUseAppointmentUserProfileQuery = jest.fn();
jest.mock(
  "@/src/features/appointment-detail/appointment-info/hooks/useAppointmentUserProfileQuery",
  () => ({
    __esModule: true,
    default: (...args: unknown[]) =>
      mockUseAppointmentUserProfileQuery(...args),
  }),
);

const mockUseAppointmentQuery = jest.fn();
jest.mock("@/src/features/appointment-detail/hooks/useAppointmentQuery", () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseAppointmentQuery(...args),
}));

// useQueryClient: prefetchQuery만 노출하는 mock. 실제 QueryClientProvider는
// renderWithProviders가 제공하므로 spread로 실제 구현을 보존한다.
const mockPrefetchQuery = jest.fn().mockResolvedValue(undefined);
jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQueryClient: () => ({ prefetchQuery: mockPrefetchQuery }),
}));

// 자식 컴포넌트: 렌더링 여부 확인을 위해 data-testid를 노출하는 최소 mock으로 대체.
// VoteDateForm은 onSubmit 콜백을 트리거할 버튼도 함께 제공한다.
jest.mock("./VoteDateForm", () => ({
  __esModule: true,
  default: ({ onSubmit }: { onSubmit: () => void }) => (
    <div data-testid="vote-date-form">
      <button type="button" onClick={onSubmit}>
        투표완료
      </button>
    </div>
  ),
}));

jest.mock("./ViewTotalVoteCalendar", () => ({
  __esModule: true,
  default: () => <div data-testid="view-total-vote-calendar" />,
}));

jest.mock("./ViewUserVoteCalendar", () => ({
  __esModule: true,
  default: () => <div data-testid="view-user-vote-calendar" />,
}));

jest.mock("./VoteCountButton", () => ({
  __esModule: true,
  default: () => null,
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PROFILE_DATA = {
  id: 1,
  memberNickName: "테스트유저",
  startingPlace: null,
};

const APPOINTMENT_DATA = {
  appointment: {
    appointmentId: "appt-1",
    appointmentName: "테스트 약속",
    appointmentDueDate: "2026-04-01",
    confirmYn: "N" as const,
    profileYn: "Y" as const,
    hostYn: "Y" as const,
    dday: "D-10",
    appointmentUserId: 1,
  },
  appointmentUserList: [],
  confirmedResult: null,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let user: ReturnType<typeof userEvent.setup>;

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  user = userEvent.setup();
  mockUseAppointmentPage.mockReturnValue({
    selectedParticipantId: null,
    selectParticipant: mockSelectParticipant,
    selectedPlaceId: null,
    selectPlace: jest.fn(),
  });
  mockUseAppointmentUserProfileQuery.mockReturnValue({ data: PROFILE_DATA });
  mockUseAppointmentQuery.mockReturnValue({ data: APPOINTMENT_DATA });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("DateVoteSection", () => {
  describe("기본 VIEW 모드", () => {
    it("전체 투표 현황 캘린더가 표시된다", () => {
      // Given / When
      renderWithProviders(<DateVoteSection appointmentId="appt-1" />);

      // Then
      expect(
        screen.getByTestId("view-total-vote-calendar"),
      ).toBeInTheDocument();
    });

    it("선택하기 버튼이 표시된다", () => {
      // Given / When
      renderWithProviders(<DateVoteSection appointmentId="appt-1" />);

      // Then
      expect(
        screen.getByRole("button", { name: "선택하기" }),
      ).toBeInTheDocument();
    });
  });

  describe("선택하기 버튼 활성화/비활성화", () => {
    it("약속이 확정된 경우(confirmYn='Y') 선택하기 버튼이 비활성이다", () => {
      // Given
      mockUseAppointmentQuery.mockReturnValue({
        data: {
          ...APPOINTMENT_DATA,
          appointment: {
            ...APPOINTMENT_DATA.appointment,
            confirmYn: "Y" as const,
          },
        },
      });

      // When
      renderWithProviders(<DateVoteSection appointmentId="appt-1" />);

      // Then
      expect(screen.getByRole("button", { name: "선택하기" })).toBeDisabled();
    });

    it("투표 가능 조건을 모두 충족하면 선택하기 버튼이 활성화된다", () => {
      // Given — beforeEach 기본값: profileData 있음, confirmYn='N', appointmentData 있음

      // When
      renderWithProviders(<DateVoteSection appointmentId="appt-1" />);

      // Then
      expect(screen.getByRole("button", { name: "선택하기" })).toBeEnabled();
    });
  });

  describe("참여자 선택 시 (selectedParticipantId !== null)", () => {
    it("해당 참여자의 투표 현황 캘린더가 표시된다", () => {
      // Given
      mockUseAppointmentPage.mockReturnValue({
        selectedParticipantId: 2,
        selectParticipant: mockSelectParticipant,
        selectedPlaceId: null,
        selectPlace: jest.fn(),
      });

      // When
      renderWithProviders(<DateVoteSection appointmentId="appt-1" />);

      // Then
      expect(
        screen.getByTestId("view-user-vote-calendar"),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId("view-total-vote-calendar"),
      ).not.toBeInTheDocument();
    });
  });

  describe("선택하기 버튼 클릭", () => {
    it("참여자 선택이 해제된다", async () => {
      // Given
      renderWithProviders(<DateVoteSection appointmentId="appt-1" />);

      // When
      await user.click(screen.getByRole("button", { name: "선택하기" }));

      // Then
      expect(mockSelectParticipant).toHaveBeenCalledWith(null);
    });

    it("투표 폼으로 전환된다", async () => {
      // Given
      renderWithProviders(<DateVoteSection appointmentId="appt-1" />);

      // When
      await user.click(screen.getByRole("button", { name: "선택하기" }));

      // Then — prefetchQuery가 resolve된 후 mode="VOTE"로 전환됨
      await waitFor(() =>
        expect(screen.getByTestId("vote-date-form")).toBeInTheDocument(),
      );
      expect(
        screen.queryByTestId("view-total-vote-calendar"),
      ).not.toBeInTheDocument();
    });
  });

  describe("투표 폼 제출 후", () => {
    it("전체 투표 현황 보기로 복귀한다", async () => {
      // Given — 투표 폼 진입
      renderWithProviders(<DateVoteSection appointmentId="appt-1" />);
      await user.click(screen.getByRole("button", { name: "선택하기" }));
      await waitFor(() => screen.getByTestId("vote-date-form"));

      // When — VoteDateForm의 onSubmit 트리거 (mock의 "투표완료" 버튼)
      await user.click(screen.getByRole("button", { name: "투표완료" }));

      // Then
      await waitFor(() =>
        expect(
          screen.getByTestId("view-total-vote-calendar"),
        ).toBeInTheDocument(),
      );
      expect(
        screen.queryByTestId("vote-date-form"),
      ).not.toBeInTheDocument();
    });
  });
});
