import { FormEvent, useState } from "react";
import BottomDrawer from "../shared/BottomDrawer";
import Button from "../shared/Button";
import DefaultDrawerLayout from "../shared/DefaultDrawerLayout";
import FormField from "../shared/FormField";
import { MemberProfile } from "@/types/apiResponse";
import PostcodePopup from "../shared/PostcodePopup";
import { Address } from "@/types/daum";
import { getAddressLngLat } from "@/api/kakao-local";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { joinAppointment } from "@/api/appointment";
import { registerMemberProfile } from "@/api/member";
import useLeaveAppointment from "@/hooks/useLeaveAppointment";
import { useRouter } from "next/navigation";

type Place = {
  address: string;
  startingPlace: string;
  latitude: string;
  longitude: string;
};

interface EditProfileDrawerProps {
  appointmentId: string;
  appointmentHostId: number;
  initialProfile: MemberProfile | null;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const EditProfileDrawer = ({
  appointmentId,
  appointmentHostId,
  initialProfile,
  open,
  setOpen,
}: EditProfileDrawerProps) => {
  const [nickName, setNickName] = useState(
    initialProfile?.memberNickName ?? "",
  );
  /* 출발 장소
  기존에 출발 장소를 등록한 경우, string (/member/{roomHash}가 장소명만 제공)
  지금 수정한 경우, Place (Postcode Popup에서 고른 주소를 경도/위도 포함한 타입으로 변환) 
  */
  const [startingPlace, setStartingPlace] = useState<string | Place | null>(
    () => {
      if (!initialProfile || initialProfile.startingPlace === "") return null;
      return initialProfile.startingPlace;
    },
  );

  const alreadyJoined = initialProfile !== null;

  const queryClient = useQueryClient();
  const router = useRouter();

  const isDisabled = () => {
    if (nickName === "") return true;
    if (
      nickName === initialProfile?.memberNickName &&
      startingPlace === initialProfile.startingPlace
    )
      return true;
    return false;
  };

  /* 저장하기 */
  const { mutate: mutateSubmit } = useMutation({
    mutationFn: async ({
      alreadyJoined,
      nickName,
      place,
    }: {
      alreadyJoined: boolean;
      nickName: string;
      place?: Place | null;
    }) => {
      if (!alreadyJoined) {
        await joinAppointment(appointmentId);
      }
      await registerMemberProfile(appointmentId, nickName, place);
    },
  });

  const onSubmit = async (
    e: FormEvent<HTMLFormElement>,
    closeModal: () => void,
  ) => {
    e.preventDefault();
    if (isDisabled()) return;

    // 출발 장소
    const place = typeof startingPlace === "string" ? undefined : startingPlace;

    mutateSubmit(
      { alreadyJoined, nickName, place },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({
            queryKey: ["appointment-user-profile", appointmentId],
          });
          await queryClient.invalidateQueries({
            queryKey: ["appointment", appointmentId],
          });
          
          closeModal();
        },
        onError: () => {
          alert("프로필 수정에 실패하였습니다. 잠시후 다시 시도해주세요.");
        },
      },
    );
  };

  /* 출발 장소 주소 입력 */
  const [postcodePopupOpen, setPostcodePopupOpen] = useState(false);

  const openSearchAddressPopup = () => {
    setPostcodePopupOpen(true);
  };

  const onCompleteAddressPopup = async (address: Address) => {
    try {
      const { longitude, latitude } = await getAddressLngLat(address.address);
      const placeName =
        address.buildingName !== "" ? address.buildingName : address.address;
      const place: Place = {
        address: address.address,
        startingPlace: placeName,
        longitude,
        latitude,
      };
      setStartingPlace(place);
    } catch (error) {
      alert("주소 변환 실패");
    }
  };

  const startingPlaceStr =
    typeof startingPlace === "string"
      ? startingPlace
      : startingPlace?.startingPlace;

  /* 약속 나가기 */
  const canLeave = alreadyJoined && initialProfile.id !== appointmentHostId;

  const { mutate: mutateLeave } = useLeaveAppointment(appointmentId);

  const leaveAppointment = () => {
    mutateLeave(undefined, {
      onSuccess: () => {
        router.push("/setup-meeting");
      },
      onError: () => {
        alert("약속 나가기에 실패했습니다. 잠시후 다시 시도해주세요.");
      },
    });
  };

  return (
    <BottomDrawer open={open} onOpenChange={setOpen}>
      {({ close }) => (
        <DefaultDrawerLayout
          title="내 정보"
          secondaryAction={
            canLeave
              ? { label: "약속 나가기", onClick: leaveAppointment }
              : undefined
          }
          close={close}
        >
          <form
            className="flex flex-col gap-40"
            onSubmit={(e) => onSubmit(e, close)}
          >
            <div className="mt-16 flex flex-col gap-16">
              <FormField label="이름" required inputId="name">
                <div className="input-container">
                  <input
                    className="input typo-16-regular"
                    id="name"
                    name="name"
                    type="text"
                    value={nickName}
                    onChange={(event) => setNickName(event.target.value)}
                  />
                </div>
              </FormField>
              <FormField
                label="출발 장소"
                inputId="departure-location"
                description="장소 투표 결과가 같을 경우, 모두의 출발지에서 가까운 중간 지점을 추천해 드려요."
              >
                <div
                  className="input-container cursor-pointer"
                  onClick={openSearchAddressPopup}
                >
                  {startingPlace ? (
                    <div className="input typo-16-regular">
                      {startingPlaceStr}
                    </div>
                  ) : (
                    /* typo-16-regular 글자 높이만큼 빈 */
                    <div className="h-26 w-full" />
                  )}
                  <input
                    type="hidden"
                    id="departure-location"
                    name="departure-location"
                    value={startingPlaceStr ?? ""}
                  />
                </div>
              </FormField>
            </div>
            <Button className="h-56" size="Large" disabled={isDisabled()}>
              저장하기
            </Button>
          </form>

          {/* 주소 입력 팝업 */}
          <PostcodePopup
            open={postcodePopupOpen}
            setOpen={setPostcodePopupOpen}
            onComplete={onCompleteAddressPopup}
          />
        </DefaultDrawerLayout>
      )}
    </BottomDrawer>
  );
};

export default EditProfileDrawer;
