import { DayPicker } from "react-day-picker";
import { ko } from "react-day-picker/locale";
import "react-day-picker/style.css";

interface DatePickerProps {
  selected: Date | undefined;
  onSelect: (selected: Date | undefined) => void;
}

const DatePicker = ({ onSelect }: DatePickerProps) => {
  return (
    <DayPicker
      mode="single"
      className="bg-white border border-gray-300 p-12"
      onSelect={onSelect}
      locale={ko}
    />
  );
};

export default DatePicker;
