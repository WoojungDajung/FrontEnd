"use client";

import { useState } from "react";
import CalendarIcon from "../home/CalendarIcon";
import DatePicker from "../home/DatePicker";

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

interface DateInputProps {
  value?: Date | undefined;
  onValueChange?: (value: Date | undefined) => void;
}

const DateInput = ({ value, onValueChange }: DateInputProps) => {
  const [datePickerOpened, setDatePickerOpened] = useState(false);

  return (
    <div
      className="input-container flex flex-row gap-8 relative"
      data-focus={datePickerOpened}
    >
      <CalendarIcon />
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
        id="deadline"
        name="deadline"
        value={value ? formatDate(value) : ""}
        required
      />

      {datePickerOpened && (
        <div className="absolute bottom-full left-0">
          <DatePicker
            selected={value}
            onSelect={
              onValueChange ? (selected) => onValueChange(selected) : undefined
            }
          />
        </div>
      )}
    </div>
  );
};

export default DateInput;
