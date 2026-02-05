import BottomDrawer from "../shared/BottomDrawer";
import DefaultDrawerLayout from "../shared/DefaultDrawerLayout";
import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import useLocationInfoQuery from "@/hooks/useLocationInfoQuery";
import useDeleteLocation from "@/hooks/useDeleteLocation";
import LoadingSpinner from "../shared/LoadingSpinner";

interface PlaceInfoDrawerProps {
  placeId: number;
  appointmentId: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const PlaceInfoDrawer = ({
  placeId,
  appointmentId,
  open,
  setOpen,
}: PlaceInfoDrawerProps) => {
  // 실제 드로워가 화면 상에 오픈되었는지
  const [isDrawerOpened, setIsDrawerOpened] = useState(false);

  const { data } = useLocationInfoQuery({
    appointmentId,
    placeId,
    enabled: isDrawerOpened,
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);

  /* 장소 삭제 */
  const { mutateAsync } = useDeleteLocation(appointmentId, placeId);
  const deletePlace = async (closeModal: () => void) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      await mutateAsync();
      closeModal();
    }
  };

  // 지도 표시
  useEffect(() => {
    if (!isDrawerOpened) return;
    if (!mapContainerRef.current) return;
    if (data === undefined) return;

    const lat = Number(data.latitude);
    const lng = Number(data.longitude);

    const position = new window.kakao.maps.LatLng(lat, lng);
    const map = new window.kakao.maps.Map(mapContainerRef.current, {
      center: position,
      level: 3,
    });
    const marker = new window.kakao.maps.Marker({
      position,
    });
    marker.setMap(map);
  }, [isDrawerOpened, data]);

  const onDrawerOpen = useCallback((visible: boolean) => {
    setIsDrawerOpened(visible);
  }, []);

  const onLoadScript = () => {
    console.log("카카오 맵 sdk loaded");
    window.kakao.maps.load();
  };

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&autoload=false`}
        type="text/javascript"
        onLoad={onLoadScript}
      />

      <BottomDrawer
        open={open}
        onOpenChange={setOpen}
        onVisibleChange={onDrawerOpen}
      >
        {({ close }) => (
          <DefaultDrawerLayout
            title="장소 정보"
            secondaryAction={{
              label: "삭제하기",
              onClick: () => deletePlace(close),
            }}
            close={close}
          >
            {data ? <div className="flex flex-col gap-16">
              <div className="flex flex-col gap-16 w-full">
                <div>
                  <p className="typo-16-regular text-gray-800">{data.name}</p>
                  <p className="typo-14-regular text-gray-500">
                    {data.address}
                  </p>
                </div>
                <div className="flex flex-col gap-8">
                  <Link
                    href={`https://map.kakao.com/link/map/${Number(data.latitude)},${Number(data.longitude)}`}
                    target="_blank"
                  >
                    <div
                      ref={mapContainerRef}
                      className="w-342 h-176 rounded-[16px]"
                    />
                  </Link>
                  <p className="text-end typo-12-regular text-[#94999E]">
                    지도를 누르면 카카오맵으로 이동합니다.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-8">
                <p className="typo-14-regular text-gray-500">
                  이 장소를 선택한 친구들
                </p>
                <div className="flex flex-wrap gap-8">
                  {data.selectedList.map((voter, idx) => (
                    <div
                      key={`voter-${idx}`}
                      className="px-12 py-8 bg-gray-100 text-gray-800 typo-14-regular rounded-[100px]"
                    >
                      {voter}
                    </div>
                  ))}
                </div>
              </div>
            </div> : (
              <div className="w-full h-full grid place-items-center"><LoadingSpinner size={35} open={true} /></div>
            )}
          </DefaultDrawerLayout>
        )}
      </BottomDrawer>
    </>
  );
};

export default PlaceInfoDrawer;
