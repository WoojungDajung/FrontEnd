import { Place } from "@/types/meeting";
import BottomDrawer from "../shared/BottomDrawer";
import DefaultDrawerLayout from "../shared/DefaultDrawerLayout";

interface PlaceInfoDrawerProps {
  place: Place;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const PlaceInfoDrawer = ({ place, open, setOpen }: PlaceInfoDrawerProps) => {
  const canDelete = true;
  const deletePlace = () => {
    // 장소 삭제
  };

  const voters = ["Name", "Name", "Name", "Name"];

  return (
    <BottomDrawer open={open} onOpenChange={setOpen}>
      {({ close }) => (
        <DefaultDrawerLayout
          title="장소 정보"
          secondaryAction={
            canDelete ? { label: "삭제하기", onClick: deletePlace } : undefined
          }
          close={close}
        >
          <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-16 w-full">
              <div>
                <p className="typo-16-regular text-gray-800">{place.name}</p>
                <p className="typo-14-regular text-gray-500">{place.address}</p>
              </div>
              <div className="flex flex-col gap-8">
                <div className="w-342 h-176 rounded-[16px]" />
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
  );
};

export default PlaceInfoDrawer;
