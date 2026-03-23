import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils/render";
import { AppointmentPageProvider } from "../../context/AppointmentContext";
import VotePlaceForm from "./VotePlaceForm";
import { Location } from "../types";

// ---------------------------------------------------------------------------
// Module mocks (외부 경계만 mock)
// ---------------------------------------------------------------------------

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
// fetch mock
// ---------------------------------------------------------------------------

const mockFetch = jest.fn();

beforeEach(() => {
  global.fetch = mockFetch;
  process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
});

// ---------------------------------------------------------------------------
// 응답 fixture 헬퍼
// ---------------------------------------------------------------------------

function setupFetch(ok = true) {
  mockFetch.mockResolvedValue({
    ok,
    json: () =>
      Promise.resolve(
        ok
          ? { status_code: 200, data: {} }
          : { status_code: 500, message: "서버 오류" },
      ),
  });
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PLACES: Location[] = [
  {
    id: 1,
    name: "강남역",
    address: "서울 강남구",
    voteCount: "3",
    percentage: "60",
  },
  {
    id: 2,
    name: "홍대입구역",
    address: "서울 마포구",
    voteCount: "2",
    percentage: "40",
  },
];

const DEFAULT_PROPS = {
  places: PLACES,
  myVotedPlaceIdList: [] as number[],
  totalCount: 5,
  appointmentId: "appt-1",
  isHost: false,
  onCompleteVote: jest.fn(),
};

// ---------------------------------------------------------------------------
// 헬퍼
// ---------------------------------------------------------------------------

// PlaceItem의 최상위 카드 컨테이너 div를 반환한다.
// PlaceItem 구조: <> <div className="w-310 h-104 ..."> ... <div>장소명</div>
function getPlaceCard(placeName: string): HTMLElement {
  const el = screen.getByText(placeName).closest("div[class*='h-104']");
  if (!el) throw new Error(`place card not found: ${placeName}`);
  return el as HTMLElement;
}

function renderForm(props = DEFAULT_PROPS) {
  return renderWithProviders(
    <AppointmentPageProvider>
      <VotePlaceForm {...props} />
    </AppointmentPageProvider>,
  );
}

// ---------------------------------------------------------------------------
// 테스트
// ---------------------------------------------------------------------------

describe("VotePlaceForm 통합", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    setupFetch();
  });

  describe("초기 투표 상태 반영", () => {
    it("myVotedPlaceIdList에 있는 장소는 처음부터 voted 스타일이 적용된다", () => {
      renderForm({ ...DEFAULT_PROPS, myVotedPlaceIdList: [1] });

      expect(getPlaceCard("강남역")).toHaveClass("bg-primary-25");
      expect(getPlaceCard("홍대입구역")).not.toHaveClass("bg-primary-25");
    });
  });

  describe("장소 선택 토글", () => {
    it("미선택 장소를 클릭하면 voted 스타일이 적용된다", async () => {
      renderForm();
      const card = getPlaceCard("강남역");
      expect(card).not.toHaveClass("bg-primary-25");

      await user.click(screen.getByText("강남역"));

      expect(card).toHaveClass("bg-primary-25");
    });

    it("이미 선택된 장소를 클릭하면 voted 스타일이 제거된다", async () => {
      renderForm({ ...DEFAULT_PROPS, myVotedPlaceIdList: [1] });
      const card = getPlaceCard("강남역");
      expect(card).toHaveClass("bg-primary-25");

      await user.click(screen.getByText("강남역"));

      expect(card).not.toHaveClass("bg-primary-25");
    });
  });

  describe("저장하기 — 성공", () => {
    it("선택한 장소 ID가 API 페이로드에 포함된다", async () => {
      renderForm();
      await user.click(screen.getByText("강남역"));
      await user.click(screen.getByRole("button", { name: "저장하기" }));

      await waitFor(() => {
        const body = JSON.parse(
          (mockFetch.mock.calls[0][1] as RequestInit).body as string,
        );
        expect(body.placeList).toEqual([1]);
      });
    });

    it("초기 선택 상태로 저장하면 API가 기존 투표 ID로 호출된다", async () => {
      renderForm({ ...DEFAULT_PROPS, myVotedPlaceIdList: [1, 2] });
      await user.click(screen.getByRole("button", { name: "저장하기" }));

      await waitFor(() => {
        const body = JSON.parse(
          (mockFetch.mock.calls[0][1] as RequestInit).body as string,
        );
        expect(body.placeList).toEqual([1, 2]);
      });
    });

    it("'투표가 완료됐어요.' toast가 표시된다", async () => {
      renderForm();
      await user.click(screen.getByRole("button", { name: "저장하기" }));

      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith({ message: "투표가 완료됐어요." }),
      );
    });

    it("onCompleteVote prop이 호출된다", async () => {
      const onCompleteVote = jest.fn();
      renderForm({ ...DEFAULT_PROPS, onCompleteVote });
      await user.click(screen.getByRole("button", { name: "저장하기" }));

      await waitFor(() => expect(onCompleteVote).toHaveBeenCalledTimes(1));
    });

    it("GTM submit_vote(place) 이벤트가 전송된다", async () => {
      renderForm();
      await user.click(screen.getByRole("button", { name: "저장하기" }));

      await waitFor(() =>
        expect(mockSendGTM).toHaveBeenCalledWith(
          expect.objectContaining({
            event: "submit_vote",
            vote_type: "place",
            appointment_id: "appt-1",
          }),
        ),
      );
    });

    it("isHost=true이면 GTM user_role: 'host'가 포함된다", async () => {
      renderForm({ ...DEFAULT_PROPS, isHost: true });
      await user.click(screen.getByRole("button", { name: "저장하기" }));

      await waitFor(() =>
        expect(mockSendGTM).toHaveBeenCalledWith(
          expect.objectContaining({ user_role: "host" }),
        ),
      );
    });

    it("isHost=false이면 GTM user_role: 'guest'가 포함된다", async () => {
      renderForm();
      await user.click(screen.getByRole("button", { name: "저장하기" }));

      await waitFor(() =>
        expect(mockSendGTM).toHaveBeenCalledWith(
          expect.objectContaining({ user_role: "guest" }),
        ),
      );
    });
  });

  describe("저장하기 — 실패", () => {
    beforeEach(() => {
      setupFetch(false);
    });

    it("'투표에 실패했습니다.' toast가 표시된다", async () => {
      renderForm();
      await user.click(screen.getByRole("button", { name: "저장하기" }));

      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith({
          message: "투표에 실패했습니다. 잠시 후 다시 시도해주세요.",
        }),
      );
    });

    it("GTM 이벤트는 전송되지 않는다", async () => {
      renderForm();
      await user.click(screen.getByRole("button", { name: "저장하기" }));

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockSendGTM).not.toHaveBeenCalled();
    });
  });
});
