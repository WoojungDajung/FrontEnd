"use client";

import { useMemo, useState } from "react";
import PlaceIcon from "../meeting/icons/PlaceIcon";
import PostcodePopup from "./PostcodePopup";
import { Address } from "@/types/daum";
import { Place } from "@/types/shared";

type TValue = string | Place | null;

interface AddressInputProps {
  inputId: string;
  value?: TValue;
  onChange: (value: TValue) => void;
}

const AddressInput = ({ inputId, value, onChange }: AddressInputProps) => {
  const [address, setAddress] = useState<string>("");
  const [postcodePopupOpen, setPostcodePopupOpen] = useState(false);

  const onCompleteAddressPopup = (address: Address) => {
    // 주소 변환
    const value =
      address.buildingName !== "" ? address.buildingName : address.address;
    onChange?.(value);
    setAddress(value);
  };

  const val = useMemo(() => {
    if (value !== undefined) {
      if (value === null) return "";
      if (typeof value === "string") return value;
      return value.address;
    } else {
      return address;
    }
  }, [value, address]);

  return (
    <>
      <div
        className="input-container cursor-pointer flex gap-8 items-center"
        onClick={() => setPostcodePopupOpen(true)}
      >
        <PlaceIcon width={20} height={20} color="var(--color-gray-500)" />

        {val ? (
          <div className="input typo-16-regular">{val}</div>
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
          value={val}
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
