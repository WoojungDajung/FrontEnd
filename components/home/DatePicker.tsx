import { DayPicker } from "react-day-picker";
import { ko } from "react-day-picker/locale";
import "react-day-picker/style.css";

interface DatePickerProps {
  selected?: Date | undefined;
  onSelect?: (selected: Date | undefined) => void;
}

const DatePicker = ({ onSelect, selected }: DatePickerProps) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return (
    <DayPicker
      mode="single"
      className="bg-white border border-gray-300 p-12"
      onSelect={onSelect}
      selected={selected}
      locale={ko}
      startMonth={new Date()}
      disabled={{ before: tomorrow }}
    />
  );
};

export default DatePicker;
