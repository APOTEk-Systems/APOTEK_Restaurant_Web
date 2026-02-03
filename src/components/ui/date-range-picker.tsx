

import * as React from "react";
import { addDays, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subDays, subMonths, isSameDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  className?: string;
}

export function DateRangePicker({ dateRange, onDateRangeChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const formatDateRange = (range: DateRange) => {
    if (range.from && range.to) {
      return `${format(range.from, "MMM d, yyyy")} - ${format(range.to, "MMM d, yyyy")}`;
    }
    if (range.from) {
      return `${format(range.from, "MMM d, yyyy")} - Select end date`;
    }
    return "Select date range";
  };

  const setPresetRange = (preset: string) => {
    const today = new Date();
    let range: DateRange = { from: undefined, to: undefined };

    switch (preset) {
      case "today":
        range = { from: today, to: today };
        break;
      case "yesterday":
        const yesterday = subDays(today, 1);
        range = { from: yesterday, to: yesterday };
        break;
      case "thisWeek":
        range = {
          from: startOfWeek(today),
          to: endOfWeek(today),
        };
        break;
      case "lastWeek":
        const lastWeekStart = startOfWeek(subDays(today, 7));
        range = {
          from: lastWeekStart,
          to: endOfWeek(lastWeekStart),
        };
        break;
      case "thisMonth":
        range = {
          from: startOfMonth(today),
          to: endOfMonth(today),
        };
        break;
      case "lastMonth":
        const lastMonth = subMonths(today, 1);
        range = {
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth),
        };
        break;
    }

    onDateRangeChange(range);
    setIsOpen(false);
  };

  const handleRangeSelect = (range: DateRange | undefined) => {
    if (range) {
      onDateRangeChange(range);
      if (range.from && range.to) {
        setIsOpen(false);
      }
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[250px] justify-start text-left font-normal",
              !dateRange.from && !dateRange.to && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(dateRange)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Preset buttons */}
            <div className="flex flex-col gap-1 p-3 border-r min-w-[120px]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPresetRange("today")}
                className="justify-start"
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPresetRange("yesterday")}
                className="justify-start"
              >
                Yesterday
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPresetRange("thisWeek")}
                className="justify-start"
              >
                This Week
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPresetRange("lastWeek")}
                className="justify-start"
              >
                Last Week
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPresetRange("thisMonth")}
                className="justify-start"
              >
                This Month
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPresetRange("lastMonth")}
                className="justify-start"
              >
                Last Month
              </Button>
            </div>

            {/* Calendar */}
            <div className="p-3">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleRangeSelect}
                numberOfMonths={2}
                initialFocus
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}