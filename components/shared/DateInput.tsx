"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import CalendarIcon from "./icons/CalendarIcon";
import DatePicker from "./DatePicker";
import { createPortal } from "react-dom";
import { dateToString } from "@/utils/calendar";

interface DateInputProps {
  value?: Date | undefined;
  onValueChange?: (value: Date | undefined) => void;
  id?: string;
  name?: string;
}

const DateInput = ({ value, onValueChange, id, name }: DateInputProps) => {
  const [datePickerOpened, setDatePickerOpened] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!containerRef.current || !datePickerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const pickerRect = datePickerRef.current.getBoundingClientRect();

    let top = containerRect.top - pickerRect.height;

    if (top < 0) {
      top = containerRect.bottom;
    }

    datePickerRef.current.style.top = `${top}px`;
    datePickerRef.current.style.left = `${containerRect.left}px`;
  }, []);

  useLayoutEffect(() => {
    if (datePickerOpened) {
      updatePosition();
    }
  }, [datePickerOpened, updatePosition]);

  useEffect(() => {
    if (!datePickerOpened) return;

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [datePickerOpened, updatePosition]);

  const onSelect = (selected: Date | undefined) => {
    onValueChange?.(selected);
    setDatePickerOpened(false);
  };

  return (
    <div
      className="input-container box-border h-56 flex flex-row gap-8 relative"
      data-focus={datePickerOpened}
      ref={containerRef}
    >
      <CalendarIcon width={20} height={20} color="var(--color-gray-500)" />
      <div
        onClick={() => setDatePickerOpened((prev) => !prev)}
        className="w-full typo-16-regular cursor-pointer"
      >
        {value ? (
          <p className="input">{dateToString(value)}</p>
        ) : (
          <p className="input-placeholder">연도-월-일</p>
        )}
      </div>
      <input
        type="hidden"
        id={id}
        name={name}
        value={value ? dateToString(value) : ""}
        required
      />

      {datePickerOpened &&
        createPortal(
          <div ref={datePickerRef} className="fixed">
            <DatePicker selected={value} onSelect={onSelect} />
          </div>,
          document.getElementById("popup")!,
        )}
    </div>
  );
};

export default DateInput;
