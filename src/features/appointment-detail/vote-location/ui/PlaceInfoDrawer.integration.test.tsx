import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test-utils/render";
import {
  AppointmentPageProvider,
  useAppointmentPage,
} from "../../context/AppointmentContext";
import PlaceInfoDrawer from "./PlaceInfoDrawer";

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

// next/script: 카카오 SDK 스크립트 태그는 jsdom에서 로드되지 않으므로 무시한다.
jest.mock("next/script", () => ({
  __esModule: true,
  default: () => null,
}));

// BottomDrawer: portal + 300ms 애니메이션 → children을 즉시 렌더링하는 wrapper로 대체.
// close()가 호출되면 onOpenChange(false)를 실행해 드로어 닫힘 흐름을 유지한다.
jest.mock("@/src/shared/ui/BottomDrawer", () => ({
  __esModule: true,
  default: ({
    open,
    onOpenChange,
    children,
  }: {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    children: (api: { close: () => void }) => React.ReactNode;
  }) => {
    const close = () => onOpenChange?.(false);
    return open ? <>{children({ close })}</> : null;
  },
}));

// LoadingSpinner: data-testid로 로딩 상태를 검증한다.
jest.mock("@/src/shared/ui/LoadingSpinner", () => ({
  __esModule: true,
  default: ({
    open,
    onClose,
  }: {
    size?: number;
    open: boolean;
    success?: boolean;
    onClose?: () => void;
  }) =>
    open ? (
      <div data-testid="loading-spinner">
        {onClose && (
          <button type="button" onClick={onClose}>
            닫기
          </button>
        )}
      </div>
    ) : null,
}));

// ---------------------------------------------------------------------------
// Kakao Maps SDK mock
// window.kakao.maps.* 는 jsdom에 없으므로 전역으로 설정한다.
// ---------------------------------------------------------------------------

beforeAll(() => {
  (window as Window & { kakao?: unknown }).kakao = {
    maps: {
      load: jest.fn(),
      LatLng: jest.fn(),
      Map: jest.fn(),
      Marker: jest.fn(() => ({ setMap: jest.fn() })),
    },
  };
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

const PLACE_DATA = {
  id: 1,
  name: "강남역",
  address: "서울 강남구 강남대로 지하 396",
  latitude: "37.4979",
  longitude: "127.0276",
  selectedList: ["홍길동", "김철수"],
};

function setupFetch({
  locationOk = true,
  deleteOk = true,
}: { locationOk?: boolean; deleteOk?: boolean } = {}) {
  mockFetch.mockImplementation((_url: string, init?: RequestInit) => {
    if (init?.method === "DELETE") {
      return Promise.resolve({
        ok: deleteOk,
        json: () =>
          Promise.resolve(
            deleteOk
              ? { status_code: 200, data: {} }
              : { status_code: 500, message: "서버 오류" },
          ),
      });
    }
    // GET: 장소 상세 정보
    return Promise.resolve({
      ok: locationOk,
      json: () =>
        Promise.resolve(
          locationOk
            ? { status_code: 200, data: PLACE_DATA }
            : { status_code: 500, message: "서버 오류" },
        ),
    });
  });
}

// ---------------------------------------------------------------------------
// 헬퍼
// ---------------------------------------------------------------------------

// AppointmentPageContext의 selectedPlaceId를 외부에서 주입하기 위한 컨트롤러.
// useEffect로 selectPlace를 호출해 드로어를 연다.
const DrawerController = ({
  placeId,
  deletable = false,
}: {
  placeId: number | null;
  deletable?: boolean;
}) => {
  const { selectPlace } = useAppointmentPage();

  React.useEffect(() => {
    selectPlace(placeId);
  }, [placeId, selectPlace]);

  return <PlaceInfoDrawer appointmentId="appt-1" deletable={deletable} />;
};

function renderDrawer({
  placeId = 1,
  deletable = false,
}: { placeId?: number | null; deletable?: boolean } = {}) {
  return renderWithProviders(
    <AppointmentPageProvider>
      <DrawerController placeId={placeId} deletable={deletable} />
    </AppointmentPageProvider>,
  );
}

// 데이터 로드 완료를 기다리는 헬퍼
async function waitForPlaceData() {
  await waitFor(() =>
    expect(screen.getByText(PLACE_DATA.name)).toBeInTheDocument(),
  );
}

// ---------------------------------------------------------------------------
// 테스트
// ---------------------------------------------------------------------------

describe("PlaceInfoDrawer 통합", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    setupFetch();
  });

  describe("장소 정보 표시", () => {
    it("데이터 로딩 중 스피너가 표시된다", async () => {
      // fetch를 resolve하지 않아 query가 pending 상태로 유지된다
      mockFetch.mockReturnValue(new Promise(() => {}));
      renderDrawer();

      // selectedPlaceId가 설정되길 기다린 후 스피너 확인
      await waitFor(() =>
        expect(screen.getByTestId("loading-spinner")).toBeInTheDocument(),
      );
    });

    it("데이터 로딩 후 장소명과 주소가 표시된다", async () => {
      renderDrawer();

      await waitForPlaceData();
      expect(
        screen.getByText("서울 강남구 강남대로 지하 396"),
      ).toBeInTheDocument();
    });

    it("이 장소를 선택한 친구들 목록이 표시된다", async () => {
      renderDrawer();

      await waitForPlaceData();
      expect(screen.getByText("홍길동")).toBeInTheDocument();
      expect(screen.getByText("김철수")).toBeInTheDocument();
    });
  });

  describe("deletable 분기", () => {
    it("deletable=true이면 '삭제하기' 버튼이 표시된다", async () => {
      renderDrawer({ deletable: true });

      await waitForPlaceData();
      expect(
        screen.getByRole("button", { name: "삭제하기" }),
      ).toBeInTheDocument();
    });

    it("deletable=false이면 '삭제하기' 버튼이 표시되지 않는다", async () => {
      renderDrawer({ deletable: false });

      await waitForPlaceData();
      expect(
        screen.queryByRole("button", { name: "삭제하기" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("삭제 — confirm 확인", () => {
    it("DELETE API가 호출된다", async () => {
      renderDrawer({ deletable: true });
      await waitForPlaceData();

      await user.click(screen.getByRole("button", { name: "삭제하기" }));

      await waitFor(() =>
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("location/appt-1/1"),
          expect.objectContaining({ method: "DELETE" }),
        ),
      );
    });

    it("삭제 성공 시 '삭제가 완료됐어요.' toast가 표시된다", async () => {
      renderDrawer({ deletable: true });
      await waitForPlaceData();

      await user.click(screen.getByRole("button", { name: "삭제하기" }));

      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith({
          message: "삭제가 완료됐어요.",
        }),
      );
    });

    it("삭제 성공 시 드로어가 닫힌다", async () => {
      renderDrawer({ deletable: true });
      await waitForPlaceData();

      await user.click(screen.getByRole("button", { name: "삭제하기" }));

      await waitFor(() =>
        expect(screen.queryByText(PLACE_DATA.name)).not.toBeInTheDocument(),
      );
    });
  });

  describe("삭제 — confirm 취소", () => {
    it("confirm 취소 시 DELETE API가 호출되지 않는다", async () => {
      mockConfirm.mockResolvedValue(false);
      renderDrawer({ deletable: true });
      await waitForPlaceData();

      const callCountBefore = mockFetch.mock.calls.length;
      await user.click(screen.getByRole("button", { name: "삭제하기" }));

      await waitFor(() => expect(mockConfirm).toHaveBeenCalled());
      expect(mockFetch.mock.calls.length).toBe(callCountBefore);
    });
  });

  describe("삭제 실패", () => {
    beforeEach(() => {
      setupFetch({ deleteOk: false });
    });

    it("'삭제에 실패했어요.' toast가 표시된다", async () => {
      renderDrawer({ deletable: true });
      await waitForPlaceData();

      await user.click(screen.getByRole("button", { name: "삭제하기" }));

      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith({
          message: "삭제에 실패했어요. 잠시후 다시 시도해주세요.",
        }),
      );
    });

    it("삭제 실패 시 드로어가 닫히지 않는다", async () => {
      renderDrawer({ deletable: true });
      await waitForPlaceData();

      await user.click(screen.getByRole("button", { name: "삭제하기" }));

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(screen.getByText(PLACE_DATA.name)).toBeInTheDocument();
    });
  });
});
