"use client";

import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { format, subDays, subWeeks, subMonths, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear } from "date-fns";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface DateRange {
  from: Date;
  to: Date;
  label: string;
}

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const presets: { label: string; getValue: () => { from: Date; to: Date } }[] = [
  {
    label: "Today",
    getValue: () => {
      const today = new Date();
      return { from: today, to: today };
    },
  },
  {
    label: "Yesterday",
    getValue: () => {
      const yesterday = subDays(new Date(), 1);
      return { from: yesterday, to: yesterday };
    },
  },
  {
    label: "Last 7 Days",
    getValue: () => ({
      from: subDays(new Date(), 7),
      to: new Date(),
    }),
  },
  {
    label: "Last 30 Days",
    getValue: () => ({
      from: subDays(new Date(), 30),
      to: new Date(),
    }),
  },
  {
    label: "This Month",
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: new Date(),
    }),
  },
  {
    label: "Last Month",
    getValue: () => {
      const lastMonth = subMonths(new Date(), 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      };
    },
  },
  {
    label: "This Quarter",
    getValue: () => ({
      from: startOfQuarter(new Date()),
      to: new Date(),
    }),
  },
  {
    label: "Last Quarter",
    getValue: () => {
      const lastQuarter = subMonths(new Date(), 3);
      return {
        from: startOfQuarter(lastQuarter),
        to: endOfQuarter(lastQuarter),
      };
    },
  },
  {
    label: "This Year",
    getValue: () => ({
      from: startOfYear(new Date()),
      to: new Date(),
    }),
  },
];

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (preset: (typeof presets)[0]) => {
    const { from, to } = preset.getValue();
    onChange({ from, to, label: preset.label });
    setIsOpen(false);
  };

  return (
    <div className="relative z-50">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="min-w-[200px] justify-between"
      >
        <span className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {value.label}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-lg bg-background-card border border-white/10 shadow-lg py-1">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handleSelect(preset)}
                className={cn(
                  "w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors",
                  value.label === preset.label
                    ? "text-gold bg-gold/10"
                    : "text-text-secondary"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
