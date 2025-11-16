import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { cn } from "@/lib/utils";

type DatePickerProps = {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
};

export function DatePicker({ date, onDateChange, placeholder = "Pick a date" }: DatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date);
  const [month, setMonth] = useState<Date>(date || new Date());

  const handleDateSelect = (newDate: Date | undefined) => {
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
          )}
          variant="outline"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          month={month}
          onMonthChange={setMonth}
          captionLayout="dropdown"
          fromYear={2020}
          toYear={2030}
        />
      </PopoverContent>
    </Popover>
  );
}
