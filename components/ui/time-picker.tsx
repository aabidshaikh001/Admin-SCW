"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value?: string
  onChange?: (time: string) => void
  format?: "12" | "24"
  placeholder?: string
  className?: string
}

export function TimePicker({
  value,
  onChange,
  format = "12",
  placeholder = "Select time",
  className,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hour, setHour] = useState<number>(format === "12" ? 12 : 0)
  const [minute, setMinute] = useState<number>(0)
  const [period, setPeriod] = useState<"AM" | "PM">("AM")

  // Parse the initial value
  useEffect(() => {
    if (value) {
      const [time, periodPart] = value.split(" ")
      const [h, m] = time.split(":")

      if (format === "12") {
        setHour(Number.parseInt(h))
        setMinute(Number.parseInt(m))
        setPeriod((periodPart as "AM" | "PM") || "AM")
      } else {
        setHour(Number.parseInt(h))
        setMinute(Number.parseInt(m))
      }
    }
  }, [value, format])

  const formatTime = (h: number, m: number, p?: "AM" | "PM") => {
    if (format === "12") {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${p}`
    } else {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
    }
  }

  const handleTimeChange = () => {
    const timeString = formatTime(hour, minute, format === "12" ? period : undefined)
    onChange?.(timeString)
  }

  const handleHourChange = (newHour: number) => {
    if (format === "12") {
      if (newHour >= 1 && newHour <= 12) {
        setHour(newHour)
      }
    } else {
      if (newHour >= 0 && newHour <= 23) {
        setHour(newHour)
      }
    }
  }

  const handleMinuteChange = (newMinute: number) => {
    if (newMinute >= 0 && newMinute <= 59) {
      setMinute(newMinute)
    }
  }

  const displayValue = value || ""

  const hours = format === "12" ? Array.from({ length: 12 }, (_, i) => i + 1) : Array.from({ length: 24 }, (_, i) => i)

  const minutes = Array.from({ length: 12 }, (_, i) => i * 5) // 5-minute intervals

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !displayValue && "text-muted-foreground",
            className,
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayValue || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="text-sm font-medium">Select Time</div>

          <div className="flex items-center justify-center space-x-2">
            {/* Hour Picker */}
            <div className="flex flex-col items-center space-y-2">
              <label className="text-xs text-muted-foreground">Hour</label>
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-12 p-0"
                  onClick={() => {
                    const newHour = format === "12" ? (hour === 12 ? 1 : hour + 1) : hour === 23 ? 0 : hour + 1
                    handleHourChange(newHour)
                  }}
                >
                  ▲
                </Button>
                <div className="w-12 h-10 flex items-center justify-center border rounded text-sm font-medium">
                  {format === "24" ? hour.toString().padStart(2, "0") : hour}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-12 p-0"
                  onClick={() => {
                    const newHour = format === "12" ? (hour === 1 ? 12 : hour - 1) : hour === 0 ? 23 : hour - 1
                    handleHourChange(newHour)
                  }}
                >
                  ▼
                </Button>
              </div>
            </div>

            <div className="text-lg font-medium pt-6">:</div>

            {/* Minute Picker */}
            <div className="flex flex-col items-center space-y-2">
              <label className="text-xs text-muted-foreground">Minute</label>
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-12 p-0"
                  onClick={() => {
                    const newMinute = minute === 55 ? 0 : minute + 5
                    handleMinuteChange(newMinute)
                  }}
                >
                  ▲
                </Button>
                <div className="w-12 h-10 flex items-center justify-center border rounded text-sm font-medium">
                  {minute.toString().padStart(2, "0")}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-12 p-0"
                  onClick={() => {
                    const newMinute = minute === 0 ? 55 : minute - 5
                    handleMinuteChange(newMinute)
                  }}
                >
                  ▼
                </Button>
              </div>
            </div>

            {/* AM/PM Picker for 12-hour format */}
            {format === "12" && (
              <div className="flex flex-col items-center space-y-2">
                <label className="text-xs text-muted-foreground">Period</label>
                <div className="flex flex-col items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-12 p-0"
                    onClick={() => setPeriod(period === "AM" ? "PM" : "AM")}
                  >
                    ▲
                  </Button>
                  <div className="w-12 h-10 flex items-center justify-center border rounded text-sm font-medium">
                    {period}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-12 p-0"
                    onClick={() => setPeriod(period === "AM" ? "PM" : "AM")}
                  >
                    ▼
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Time Presets */}
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Quick Select</div>
            <div className="grid grid-cols-3 gap-2">
              {format === "12" ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent"
                    onClick={() => {
                      setHour(9)
                      setMinute(0)
                      setPeriod("AM")
                    }}
                  >
                    9:00 AM
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent"
                    onClick={() => {
                      setHour(1)
                      setMinute(0)
                      setPeriod("PM")
                    }}
                  >
                    1:00 PM
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent"
                    onClick={() => {
                      setHour(5)
                      setMinute(0)
                      setPeriod("PM")
                    }}
                  >
                    5:00 PM
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent"
                    onClick={() => {
                      setHour(9)
                      setMinute(0)
                    }}
                  >
                    09:00
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent"
                    onClick={() => {
                      setHour(13)
                      setMinute(0)
                    }}
                  >
                    13:00
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent"
                    onClick={() => {
                      setHour(17)
                      setMinute(0)
                    }}
                  >
                    17:00
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setHour(format === "12" ? 12 : 0)
                setMinute(0)
                setPeriod("AM")
                onChange?.("")
              }}
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => {
                handleTimeChange()
                setIsOpen(false)
              }}
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
