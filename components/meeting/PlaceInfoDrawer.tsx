import BottomDrawer from "../shared/BottomDrawer";
import DefaultDrawerLayout from "../shared/DefaultDrawerLayout";
import { useCallback, useRef } from "react";
import Script from "next/script";
import Link from "next/link";
import { Location } from "@/types/apiResponse";

interface PlaceInfoDrawerProps {
  place: Location;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const PlaceInfoDrawer = ({ place, open, setOpen }: PlaceInfoDrawerProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const deletePlace = () => {
    // 장소 삭제
  };

  const onDrawerOpen = useCallback((visible: boolean) => {
    if (visible) {
      if (!mapContainerRef.current) return;
      // TODO: 실제 장소 좌표 값으로 교체
      const position = new window.kakao.maps.LatLng(
        36.350754308409904,
        127.38650139748687,
      );
      const map = new window.kakao.maps.Map(mapContainerRef.current, {
        center: position,
        level: 3,
      });
      const marker = new window.kakao.maps.Marker({
        position,
      });
      marker.setMap(map);
    }
  }, []);

  const onLoadScript = () => {
    console.log("카카오 맵 sdk loaded");
    window.kakao.maps.load();
  };

  // 예시 값
  const canDelete = true;
  const voters = ["Name", "Name", "Name", "Name"];

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
            secondaryAction={
              canDelete
                ? { label: "삭제하기", onClick: deletePlace }
                : undefined
            }
            close={close}
          >
            <div className="flex flex-col gap-16">
              <div className="flex flex-col gap-16 w-full">
                <div>
                  <p className="typo-16-regular text-gray-800">{place.name}</p>
                  <p className="typo-14-regular text-gray-500">
                    {place.address}
                  </p>
                </div>
                <div className="flex flex-col gap-8">
                  <Link
                    // TODO: 실제 장소 좌표 값으로 변경
                    href={`https://map.kakao.com/link/map/${36.350754308409904},${127.38650139748687}`}
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
                  {voters.map((voter, idx) => (
                    <div
                      key={`voter-${idx}`}
                      className="px-12 py-8 bg-gray-100 text-gray-800 typo-14-regular rounded-[100px]"
                    >
                      {voter}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DefaultDrawerLayout>
        )}
      </BottomDrawer>
    </>
  );
};

export default PlaceInfoDrawer;
