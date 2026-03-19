import Link from "next/link";
import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";
import { useToastStore } from "@/src/shared/toast/toastStore";
import { useConfirmStore } from "@/src/shared/confirm/confirmStore";
import BottomDrawer from "@/src/shared/ui/BottomDrawer";
import DefaultDrawerLayout from "@/src/shared/ui/layouts/DefaultDrawerLayout";
import LoadingSpinner from "@/src/shared/ui/LoadingSpinner";
import { useAppointmentPage } from "../../context/AppointmentContext";
import useLocationInfoQuery from "../hooks/useLocationInfoQuery";
import useDeleteLocation from "../hooks/useDeleteLocation";

interface PlaceInfoDrawerProps {
  appointmentId: string;
  deletable: boolean;
}

const PlaceInfoDrawer = ({
  appointmentId,
  deletable,
}: PlaceInfoDrawerProps) => {
  const { selectedPlaceId, selectPlace } = useAppointmentPage();

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) selectPlace(null);
    },
    [selectPlace],
  );

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&autoload=false`}
        type="text/javascript"
        onLoad={() => {
          console.log("카카오 맵 sdk loaded");
          window.kakao.maps.load();
        }}
      />

      <BottomDrawer open={selectedPlaceId !== null} onOpenChange={onOpenChange}>
        {({ close }) =>
          selectedPlaceId !== null ? (
            <PlaceInfoDrawerContent
              placeId={selectedPlaceId}
              appointmentId={appointmentId}
              closeModal={close}
              deletable={deletable}
            />
          ) : (
            <></>
          )
        }
      </BottomDrawer>
    </>
  );
};

export default PlaceInfoDrawer;

interface PlaceInfoDrawerContentProps {
  placeId: number;
  appointmentId: string;
  closeModal: () => void;
  deletable: boolean;
}

const PlaceInfoDrawerContent = ({
  placeId,
  appointmentId,
  closeModal,
  deletable,
}: PlaceInfoDrawerContentProps) => {
  const confirm = useConfirmStore((state) => state.confirm);
  const toast = useToastStore((state) => state.toast);

  const { data } = useLocationInfoQuery({
    appointmentId,
    placeId,
  });

  /* 지도 표시 */
  const mapContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
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
  }, [data]);

  /* 삭제하기 */
  const { mutate, isPending, isSuccess, reset } = useDeleteLocation(
    appointmentId,
    placeId,
  );

  const deletePlace = useCallback(async () => {
    const result = await confirm({
      title: "삭제하기",
      message: (
        <>
          정말 삭제하실 건가요?
          <br />
          삭제된 정보는 되돌릴 수 없어요.
        </>
      ),
      confirmText: "삭제하기",
      cancelText: "닫기",
      variant: "danger",
    });

    if (result) {
      mutate(undefined, {
        onSuccess: () => {
          toast({ message: "삭제가 완료됐어요." });
          closeModal();
        },
        onError: () => {
          toast({ message: "삭제에 실패했어요. 잠시후 다시 시도해주세요." });
          reset();
        },
      });
    }
  }, [confirm, toast, mutate, reset, closeModal]);

  return (
    <DefaultDrawerLayout
      title="장소 정보"
      secondaryAction={
        deletable ? { label: "삭제하기", onClick: deletePlace } : undefined
      }
      close={closeModal}
    >
      {data ? (
        <div className="relative flex flex-col gap-16">
          <div className="flex flex-col gap-16 w-full">
            <div>
              <p className="typo-16-regular text-gray-800">{data.name}</p>
              <p className="typo-14-regular text-gray-500">{data.address}</p>
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

          {(isPending || isSuccess) && (
            <div className="absolute z-1 w-full h-full grid place-items-center bg-white/50">
              <LoadingSpinner
                size={35}
                open={isPending || isSuccess}
                success={isSuccess}
                onClose={() => reset()}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-full grid place-items-center">
          <LoadingSpinner size={35} open={true} />
        </div>
      )}
    </DefaultDrawerLayout>
  );
};
