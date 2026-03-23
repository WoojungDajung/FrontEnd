import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils/render";
import PlaceVoteCard from "./PlaceVoteCard";
import { ApiError } from "@/src/shared/lib/error/ApiError";
import { API_ERROR_CODE } from "@/src/shared/lib/error/errorCode";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const mockRefetchQueries = jest.fn().mockResolvedValue(undefined);
jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQueryClient: () => ({ refetchQueries: mockRefetchQueries }),
}));

const mockToast = jest.fn();
jest.mock("@/src/shared/toast/toastStore", () => ({
  useToastStore: (selector: (state: { toast: jest.Mock }) => unknown) =>
    selector({ toast: mockToast }),
}));

const mockUseAppointmentUserProfileQuery = jest.fn();
jest.mock(
  "@/src/features/appointment-detail/appointment-info/hooks/useAppointmentUserProfileQuery",
  () => ({
    __esModule: true,
    default: (...args: unknown[]) => mockUseAppointmentUserProfileQuery(...args),
  }),
);

const mockUseLocationsQuery = jest.fn();
jest.mock("../hooks/useLocationsQuery", () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseLocationsQuery(...args),
}));

const mockUseMyVoteLocationQuery = jest.fn();
jest.mock("../hooks/useMyVoteLocationQuery", () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseMyVoteLocationQuery(...args),
}));

const mockRegisterMutate = jest.fn();
const mockRegisterReset = jest.fn();
const mockUseRegisterLocation = jest.fn();
jest.mock("../hooks/useRegisterLocation", () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseRegisterLocation(...args),
}));

jest.mock("./PlaceViewList", () => ({
  __esModule: true,
  default: () => <div data-testid="place-view-list" />,
}));

// VotePlaceForm: onCompleteVote를 트리거할 버튼 제공
jest.mock("./VotePlaceForm", () => ({
  __esModule: true,
  default: ({ onCompleteVote }: { onCompleteVote: () => void }) => (
    <div data-testid="vote-place-form">
      <button onClick={onCompleteVote}>투표완료</button>
    </div>
  ),
}));

// PostcodePopup: open일 때 onComplete를 직접 호출하는 버튼 제공
jest.mock("@/src/shared/ui/PostcodePopup", () => ({
  __esModule: true,
  default: ({
    open,
    onComplete,
  }: {
    open: boolean;
    onComplete: (address: { address: string }) => void;
  }) =>
    open ? (
      <button
        onClick={() => onComplete({ address: "서울 강남구 테헤란로 1" })}
      >
        주소선택
      </button>
    ) : null,
}));

jest.mock("@/src/shared/ui/LoadingSpinner", () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="loading-spinner" /> : null,
}));

jest.mock("@/src/shared/ui/icons/PlaceIcon", () => ({
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

const LOCATIONS_DATA = {
  locationList: [
    { id: 1, name: "강남역", address: "서울 강남구", voteCount: "3", percentage: "60" },
  ],
  memberVoteRatio: "3/5",
};

const EMPTY_LOCATIONS_DATA = {
  locationList: [],
  memberVoteRatio: "0/5",
};

const DEFAULT_PROPS = {
  appointmentId: "appt-1",
  isHost: false,
};

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

let user: ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  user = userEvent.setup();
  mockUseAppointmentUserProfileQuery.mockReturnValue({ data: PROFILE_DATA });
  mockUseLocationsQuery.mockReturnValue({ data: LOCATIONS_DATA });
  mockUseMyVoteLocationQuery.mockReturnValue({ data: [] });
  mockUseRegisterLocation.mockReturnValue({
    mutate: mockRegisterMutate,
    reset: mockRegisterReset,
    isPending: false,
    isSuccess: false,
  });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("PlaceVoteCard", () => {
  describe("렌더링", () => {
    it("데이터 로딩 중에는 LoadingSpinner가 표시된다", () => {
      // Given
      mockUseLocationsQuery.mockReturnValue({ data: undefined });

      // When
      renderWithProviders(<PlaceVoteCard {...DEFAULT_PROPS} />);

      // Then
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
      expect(screen.queryByTestId("place-view-list")).not.toBeInTheDocument();
    });

    it("등록된 장소가 없으면 '장소를 등록해주세요.' 안내 문구가 표시된다", () => {
      // Given
      mockUseLocationsQuery.mockReturnValue({ data: EMPTY_LOCATIONS_DATA });

      // When
      renderWithProviders(<PlaceVoteCard {...DEFAULT_PROPS} />);

      // Then
      expect(screen.getByText("장소를 등록해주세요.")).toBeInTheDocument();
    });

    it("등록된 장소가 있으면 PlaceViewList가 표시된다", () => {
      // Given / When
      renderWithProviders(<PlaceVoteCard {...DEFAULT_PROPS} />);

      // Then
      expect(screen.getByTestId("place-view-list")).toBeInTheDocument();
    });
  });

  describe("버튼 활성화/비활성화", () => {
    it("disabled=true이면 투표하기 버튼이 비활성화된다", () => {
      // Given / When
      renderWithProviders(<PlaceVoteCard {...DEFAULT_PROPS} disabled={true} />);

      // Then
      expect(screen.getByRole("button", { name: "투표하기" })).toBeDisabled();
    });

    it("조건을 모두 충족하면 투표하기 버튼이 활성화된다", () => {
      // Given — beforeEach 기본값: profileData 있음, disabled 없음

      // When
      renderWithProviders(<PlaceVoteCard {...DEFAULT_PROPS} />);

      // Then
      expect(screen.getByRole("button", { name: "투표하기" })).toBeEnabled();
    });
  });

  describe("모드 전환", () => {
    it("투표하기 버튼을 클릭하면 VotePlaceForm이 표시된다", async () => {
      // Given
      renderWithProviders(<PlaceVoteCard {...DEFAULT_PROPS} />);

      // When
      await user.click(screen.getByRole("button", { name: "투표하기" }));

      // Then
      await waitFor(() =>
        expect(screen.getByTestId("vote-place-form")).toBeInTheDocument(),
      );
      expect(screen.queryByTestId("place-view-list")).not.toBeInTheDocument();
    });

    it("VotePlaceForm의 onCompleteVote 후 PlaceViewList로 돌아온다", async () => {
      // Given — VOTE 모드 진입
      renderWithProviders(<PlaceVoteCard {...DEFAULT_PROPS} />);
      await user.click(screen.getByRole("button", { name: "투표하기" }));
      await waitFor(() => screen.getByTestId("vote-place-form"));

      // When — VotePlaceForm의 onCompleteVote 트리거
      await user.click(screen.getByRole("button", { name: "투표완료" }));

      // Then
      expect(screen.getByTestId("place-view-list")).toBeInTheDocument();
      expect(screen.queryByTestId("vote-place-form")).not.toBeInTheDocument();
    });
  });

  describe("장소 등록", () => {
    it("장소 등록하기 버튼을 클릭하면 주소 검색 팝업이 열린다", async () => {
      // Given
      renderWithProviders(<PlaceVoteCard {...DEFAULT_PROPS} />);

      // When — VIEW 모드의 "장소 등록하기" 클릭
      await user.click(screen.getByRole("button", { name: "장소 등록하기" }));

      // Then — PostcodePopup이 열려 "주소선택" 버튼이 표시됨
      expect(screen.getByRole("button", { name: "주소선택" })).toBeInTheDocument();
    });

    it("장소 등록 성공 시 '등록이 완료됐어요.' toast를 표시한다", async () => {
      // Given
      mockRegisterMutate.mockImplementation(
        (_data: unknown, { onSuccess }: { onSuccess: () => void }) => {
          onSuccess();
        },
      );
      renderWithProviders(<PlaceVoteCard {...DEFAULT_PROPS} />);
      await user.click(screen.getByRole("button", { name: "장소 등록하기" }));

      // When
      await user.click(screen.getByRole("button", { name: "주소선택" }));

      // Then
      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith({ message: "등록이 완료됐어요." }),
      );
    });

    it("이미 등록된 장소이면 '이미 등록된 장소입니다.' toast를 표시한다", async () => {
      // Given
      mockRegisterMutate.mockImplementation(
        (_data: unknown, { onError }: { onError: (e: Error) => void }) => {
          onError(new ApiError(API_ERROR_CODE.ALREADY_EXISTS, "Already exists"));
        },
      );
      renderWithProviders(<PlaceVoteCard {...DEFAULT_PROPS} />);
      await user.click(screen.getByRole("button", { name: "장소 등록하기" }));

      // When
      await user.click(screen.getByRole("button", { name: "주소선택" }));

      // Then
      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith({
          message: "이미 등록된 장소입니다.",
        }),
      );
    });

    it("기타 오류 시 '등록에 실패했습니다.' toast를 표시한다", async () => {
      // Given
      mockRegisterMutate.mockImplementation(
        (_data: unknown, { onError }: { onError: (e: Error) => void }) => {
          onError(new Error("Network error"));
        },
      );
      renderWithProviders(<PlaceVoteCard {...DEFAULT_PROPS} />);
      await user.click(screen.getByRole("button", { name: "장소 등록하기" }));

      // When
      await user.click(screen.getByRole("button", { name: "주소선택" }));

      // Then
      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith({
          message: "등록에 실패했습니다. 잠시 후 다시 시도해주세요.",
        }),
      );
    });
  });
});
