"use client"

import * as React from "react"
import { format } from "date-fns"
import { id as IndonesianLocale } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface AttendanceControlsProps {
    dateRange: DateRange | undefined;
    setDateRange: (date: DateRange | undefined) => void;
    className?: string;
}

export function AttendanceControls({ className, dateRange, setDateRange }: AttendanceControlsProps) {
  
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "d MMM y", { locale: IndonesianLocale })} -{" "}
                  {format(dateRange.to, "d MMM y", { locale: IndonesianLocale })}
                </>
              ) : (
                format(dateRange.from, "d MMM y", { locale: IndonesianLocale })
              )
            ) : (
              <span>Pilih tanggal</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
            locale={IndonesianLocale}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
