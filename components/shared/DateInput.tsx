"use client";

import { useLayoutEffect, useRef, useState } from "react";
import CalendarIcon from "./icons/CalendarIcon";
import DatePicker from "./DatePicker";
import { createPortal } from "react-dom";

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

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

  useLayoutEffect(() => {
    if (datePickerOpened) {
      if (!containerRef.current || !datePickerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const pickerRect = datePickerRef.current.getBoundingClientRect();
      const top = containerRect.y - pickerRect.height;
      datePickerRef.current.style.top = `${top}px`;
      datePickerRef.current.style.left = `${containerRect.x}px`;
    }
  }, [datePickerOpened]);

  const onSelect = (selected: Date | undefined) => {
    onValueChange?.(selected);
    setDatePickerOpened(false);
  };

  return (
    <div
      className="input-container flex flex-row gap-8 relative"
      data-focus={datePickerOpened}
      ref={containerRef}
    >
      <CalendarIcon width={20} height={20} color="var(--color-gray-500)" />
      <div
        onClick={() => setDatePickerOpened((prev) => !prev)}
        className="w-full typo-16-regular cursor-pointer"
      >
        {value ? (
          <p className="input">{formatDate(value)}</p>
        ) : (
          <p className="input-placeholder">연도-월-일</p>
        )}
      </div>
      <input
        type="hidden"
        id={id}
        name={name}
        value={value ? formatDate(value) : ""}
        required
      />

      {datePickerOpened &&
        createPortal(
          <div ref={datePickerRef} className="absolute">
            <DatePicker selected={value} onSelect={onSelect} />
          </div>,
          document.getElementById("popup")!,
        )}
    </div>
  );
};

export default DateInput;
