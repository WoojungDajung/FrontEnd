"use client";

import { useMemo, useState } from "react";
import PlaceIcon from "../meeting/icons/PlaceIcon";
import PostcodePopup from "./PostcodePopup";
import { Address } from "@/types/daum";
import { Place } from "@/types/shared";

interface AddressInputProps {
  inputId: string;
  value?: Place | null;
  onChange?: (value: Place) => void;
  placeholder?: string;
}

const AddressInput = ({
  inputId,
  value,
  onChange,
  placeholder,
}: AddressInputProps) => {
  const [place, setPlace] = useState<Place | null>(null);
  const [postcodePopupOpen, setPostcodePopupOpen] = useState(false);

  const onCompleteAddressPopup = (address: Address) => {
    const place = {
      address: address.address,
      placeName:
        address.buildingName !== "" ? address.buildingName : address.address,
    };
    setPlace(place);
    onChange?.(place);
  };

  const val = useMemo(() => {
    const isControlled = value !== undefined;
    if (isControlled) {
      return value ? (value.placeName ?? value.address) : "";
    } else {
      return place ? (place.placeName ?? place.address) : "";
    }
  }, [value, place]);

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
          <div className="input-placeholder typo-16-regular">{placeholder}</div>
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
