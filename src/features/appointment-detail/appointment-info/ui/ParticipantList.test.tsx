import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils/render";
import ParticipantList from "./ParticipantList";

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

// EditProfileDrawer: open 상태만 노출하는 간단한 mock으로 대체한다.
jest.mock("./EditProfileDrawer", () => ({
  __esModule: true,
  default: ({ open }: { open?: boolean }) =>
    open ? <div data-testid="edit-profile-drawer" /> : null,
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MY_PROFILE = {
  id: 1,
  memberNickName: "나의닉네임",
  startingPlace: null,
};

const DEFAULT_PARTICIPANTS = [
  { id: 1, nickName: "나의닉네임", editableYn: "Y" as const },
  { id: 2, nickName: "참여자A", editableYn: "N" as const },
  { id: 3, nickName: "참여자B", editableYn: "N" as const },
];

// 3줄을 만들기 위한 최소 인원: 3개씩 3줄 = 7명 (row1: 0~2, row2: 3~5, row3: 6)
const MANY_PARTICIPANTS = [
  { id: 1, nickName: "나의닉네임", editableYn: "Y" as const },
  ...Array.from({ length: 6 }, (_, i) => ({
    id: i + 2,
    nickName: `참여자${i + 1}`,
    editableYn: "N" as const,
  })),
];

const DEFAULT_PROPS = {
  appointmentId: "appt-1",
  isHost: false,
  myProfile: MY_PROFILE,
  participants: DEFAULT_PARTICIPANTS,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let user: ReturnType<typeof userEvent.setup>;

/**
 * JSDOM에서 레이아웃을 측정하지 못하는 문제를 우회한다.
 *
 * 배지 컨테이너의 자식 요소에 offsetTop / offsetHeight 를 직접 주입해
 * compute() 함수가 "3줄 레이아웃"처럼 동작하도록 만든다.
 *   - index 0~2 → offsetTop 0   (row 1)
 *   - index 3~5 → offsetTop 50  (row 2)
 *   - index 6+  → offsetTop 100 (row 3 → canToggle = true)
 *
 * Object.defineProperty는 configurable: true로 설정해 테스트 간 간섭을 방지한다.
 * 이후 participants 배열을 새 참조로 변경해 useLayoutEffect를 재실행시킨다.
 */
function applyThreeRowLayout(renderContainer: HTMLElement) {
  const badgeContainer = renderContainer.querySelector(".flex-wrap")!;
  Array.from(badgeContainer.children).forEach((child, i) => {
    Object.defineProperty(child, "offsetTop", {
      get: () => Math.floor(i / 3) * 50,
      configurable: true,
    });
    Object.defineProperty(child, "offsetHeight", {
      get: () => 40,
      configurable: true,
    });
  });
}

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
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ParticipantList", () => {
  describe("참여자 목록 표시", () => {
    it("내 닉네임이 표시된다", () => {
      // Given / When
      renderWithProviders(<ParticipantList {...DEFAULT_PROPS} />);

      // Then
      expect(screen.getByText("나의닉네임")).toBeInTheDocument();
    });

    it("다른 참여자 닉네임이 모두 표시된다", () => {
      // Given / When
      renderWithProviders(<ParticipantList {...DEFAULT_PROPS} />);

      // Then
      expect(screen.getByText("참여자A")).toBeInTheDocument();
      expect(screen.getByText("참여자B")).toBeInTheDocument();
    });

    it("내 배지에만 프로필 수정 버튼이 있다", () => {
      // Given / When
      renderWithProviders(<ParticipantList {...DEFAULT_PROPS} />);

      // Then — JSDOM에서 canToggle=false이므로 버튼은 수정 버튼 1개뿐
      expect(screen.getAllByRole("button")).toHaveLength(1);
    });
  });

  describe("배지 클릭 (참여자 선택/해제)", () => {
    it("내 배지를 클릭하면 내 id로 selectParticipant가 호출된다", async () => {
      // Given
      renderWithProviders(<ParticipantList {...DEFAULT_PROPS} />);

      // When — span 클릭 이벤트가 부모 badge div로 버블링됨
      await user.click(screen.getByText("나의닉네임"));

      // Then
      expect(mockSelectParticipant).toHaveBeenCalledWith(MY_PROFILE.id);
    });

    it("다른 참여자 배지를 클릭하면 해당 id로 selectParticipant가 호출된다", async () => {
      // Given
      renderWithProviders(<ParticipantList {...DEFAULT_PROPS} />);

      // When
      await user.click(screen.getByText("참여자A"));

      // Then
      expect(mockSelectParticipant).toHaveBeenCalledWith(2);
    });

    it("이미 선택된 배지를 클릭하면 selectParticipant(null)이 호출된다", async () => {
      // Given — 참여자A가 이미 선택된 상태
      mockUseAppointmentPage.mockReturnValue({
        selectedParticipantId: 2,
        selectParticipant: mockSelectParticipant,
        selectedPlaceId: null,
        selectPlace: jest.fn(),
      });
      renderWithProviders(<ParticipantList {...DEFAULT_PROPS} />);

      // When
      await user.click(screen.getByText("참여자A"));

      // Then
      expect(mockSelectParticipant).toHaveBeenCalledWith(null);
    });
  });

  describe("프로필 수정 드로워", () => {
    it("초기에는 드로워가 열려있지 않다", () => {
      // Given / When
      renderWithProviders(<ParticipantList {...DEFAULT_PROPS} />);

      // Then
      expect(screen.queryByTestId("edit-profile-drawer")).not.toBeInTheDocument();
    });

    it("프로필 수정 버튼을 클릭하면 드로워가 열린다", async () => {
      // Given
      renderWithProviders(<ParticipantList {...DEFAULT_PROPS} />);

      // When
      await user.click(screen.getByRole("button", { name: "프로필 수정" }));

      // Then
      expect(screen.getByTestId("edit-profile-drawer")).toBeInTheDocument();
    });

    it("participants에 내 id가 없으면 수정 버튼과 드로워가 렌더링되지 않는다", () => {
      // Given — 나는 참여자 목록에 없는 상태 (프로필 미등록 등)
      const propsWithoutMe = {
        ...DEFAULT_PROPS,
        participants: [{ id: 2, nickName: "참여자A", editableYn: "N" as const }],
      };

      // When
      renderWithProviders(<ParticipantList {...propsWithoutMe} />);

      // Then
      expect(
        screen.queryByRole("button", { name: "프로필 수정" }),
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("edit-profile-drawer")).not.toBeInTheDocument();
    });
  });

  describe("펼치기/접기", () => {
    it("2줄 이내 참여자에게는 펼치기 버튼이 표시되지 않는다", () => {
      // Given / When — DEFAULT_PARTICIPANTS(3명)는 offsetTop=0으로 한 줄 처리
      renderWithProviders(<ParticipantList {...DEFAULT_PROPS} />);

      // Then
      expect(
        screen.queryByRole("button", { name: "펼치기" }),
      ).not.toBeInTheDocument();
    });

    it("참여자가 2줄을 초과하면 펼치기 버튼이 표시된다", () => {
      // Given
      const props = { ...DEFAULT_PROPS, participants: MANY_PARTICIPANTS };
      const { container: renderContainer, rerender } = renderWithProviders(
        <ParticipantList {...props} />,
      );

      // When — offsetTop을 주입한 뒤 새 배열 참조로 useLayoutEffect 재실행
      applyThreeRowLayout(renderContainer);
      rerender(<ParticipantList {...props} participants={[...MANY_PARTICIPANTS]} />);

      // Then
      expect(screen.getByRole("button", { name: "펼치기" })).toBeInTheDocument();
    });

    it("펼치기 버튼을 클릭하면 접기 버튼으로 전환된다", async () => {
      // Given
      const props = { ...DEFAULT_PROPS, participants: MANY_PARTICIPANTS };
      const { container: renderContainer, rerender } = renderWithProviders(
        <ParticipantList {...props} />,
      );
      applyThreeRowLayout(renderContainer);
      rerender(<ParticipantList {...props} participants={[...MANY_PARTICIPANTS]} />);

      // When
      await user.click(screen.getByRole("button", { name: "펼치기" }));

      // Then
      expect(screen.getByRole("button", { name: "접기" })).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "펼치기" }),
      ).not.toBeInTheDocument();
    });

    it("접기 버튼을 클릭하면 펼치기 버튼으로 전환된다", async () => {
      // Given
      const props = { ...DEFAULT_PROPS, participants: MANY_PARTICIPANTS };
      const { container: renderContainer, rerender } = renderWithProviders(
        <ParticipantList {...props} />,
      );
      applyThreeRowLayout(renderContainer);
      rerender(<ParticipantList {...props} participants={[...MANY_PARTICIPANTS]} />);
      await user.click(screen.getByRole("button", { name: "펼치기" }));

      // When
      await user.click(screen.getByRole("button", { name: "접기" }));

      // Then
      expect(screen.getByRole("button", { name: "펼치기" })).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "접기" }),
      ).not.toBeInTheDocument();
    });
  });
});
