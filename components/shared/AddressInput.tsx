"use client";

import { useState } from "react";
import PlaceIcon from "../meeting/icons/PlaceIcon";
import PostcodePopup from "./PostcodePopup";
import { Address } from "@/types/daum";

interface AddressInputProps {
  inputId: string;
  initialValue?: string;
}

const AddressInput = ({ inputId, initialValue }: AddressInputProps) => {
  const [address, setAddress] = useState<string>("");
  const [postcodePopupOpen, setPostcodePopupOpen] = useState(false);

  const onCompleteAddressPopup = (address: Address) => {
    // 주소 변환
    const value =
      address.buildingName !== "" ? address.buildingName : address.address;
    setAddress(value);
  };

  return (
    <>
      <div
        className="input-container cursor-pointer flex gap-8 items-center"
        onClick={() => setPostcodePopupOpen(true)}
      >
        <PlaceIcon width={20} height={20} color="var(--color-gray-500)" />

        {address ? (
          <div className="input typo-16-regular">{address}</div>
        ) : (
          <div className="input-placeholder typo-16-regular">
            서울 강서구 마곡동로 161
          </div>
        )}
        <input
          className="input"
          type="hidden"
          id={inputId}
          name={inputId}
          value={initialValue ?? ""}
        />
      </div>

      <PostcodePopup
        open={postcodePopupOpen}
        setOpen={setPostcodePopupOpen}
        onComplete={onCompleteAddressPopup}
      />
    </>
  );
};

export default AddressInput;
