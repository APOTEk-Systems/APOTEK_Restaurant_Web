import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangePickerProps {
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  className?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateRange,
  onDateRangeChange,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleRangeSelect = (range: DateRange | undefined) => {
    onDateRangeChange?.(range);
  };

  const setPresetRange = (preset: string) => {
    const now = new Date();
    let range: DateRange;

    switch (preset) {
      case "today":
        range = {
          from: startOfDay(now),
          to: endOfDay(now),
        };
        break;
      case "yesterday":
        const yesterday = subDays(now, 1);
        range = {
          from: startOfDay(yesterday),
          to: endOfDay(yesterday),
        };
        break;
      case "thisWeek":
        range = {
          from: startOfWeek(now, { weekStartsOn: 1 }),
          to: endOfWeek(now, { weekStartsOn: 1 }),
        };
        break;
      case "lastWeek":
        const lastWeek = subWeeks(now, 1);
        range = {
          from: startOfWeek(lastWeek, { weekStartsOn: 1 }),
          to: endOfWeek(lastWeek, { weekStartsOn: 1 }),
        };
        break;
      case "thisMonth":
        range = {
          from: startOfMonth(now),
          to: endOfMonth(now),
        };
        break;
      case "lastMonth":
        const lastMonth = subMonths(now, 1);
        range = {
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth),
        };
        break;
      default:
        return;
    }

    onDateRangeChange?.(range);
    setIsOpen(false);
  };

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range) return "Pick date range";
    if (range.from && range.to) {
      if (range.from.toDateString() === range.to.toDateString()) {
        return format(range.from, "PPP");
      }
      return `${format(range.from, "LLL dd")} - ${format(range.to, "LLL dd, y")}`;
    }
    return "Pick date range";
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
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(dateRange)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Preset buttons */}
            <div className="flex flex-col gap-1 p-3 border-r">
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
};

export { DateRangePicker };