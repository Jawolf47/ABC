"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

type DayStatus = "open" | "partial" | "full"

interface MonthData {
  [date: string]: DayStatus
}

export function BookingCalendar({
  selectedDate,
  onSelect,
}: {
  selectedDate: string
  onSelect: (date: string) => void
}) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [data, setData] = useState<MonthData>({})

  useEffect(() => {
    const ym = `${year}-${String(month + 1).padStart(2, "0")}`
    fetch(`/api/bookings?month=${ym}`)
      .then((r) => r.json())
      .then(setData)
  }, [year, month])

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function prevMonth() {
    if (month === 0) {
      setYear(year - 1)
      setMonth(11)
    } else {
      setMonth(month - 1)
    }
  }

  function nextMonth() {
    if (month === 11) {
      setYear(year + 1)
      setMonth(0)
    } else {
      setMonth(month + 1)
    }
  }

  const monthLabel = new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const cells: React.ReactNode[] = []

  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} />)
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    const dateObj = new Date(year, month, d)
    const dayOfWeek = dateObj.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const status: DayStatus = data[key] || "open"
    const isPast = dateObj < new Date(today.toDateString())
    const isSelected = key === selectedDate
    const isDisabled = !isWeekend || status === "full" || isPast

    cells.push(
      <button
        key={key}
        type="button"
        disabled={isDisabled}
        onClick={() => onSelect(key)}
        className={cn(
          "flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-colors",
          isSelected
            ? "bg-amber-600 text-white"
            : isDisabled
              ? "cursor-not-allowed text-zinc-300"
              : status === "partial"
                ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "text-zinc-700 hover:bg-zinc-100",
        )}
      >
        {d}
      </button>,
    )
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-zinc-900">{monthLabel}</span>
        <button
          type="button"
          onClick={nextMonth}
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-medium text-zinc-500">
        {DAYS.map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-amber-50 border border-amber-200" />
          <span>Few spots</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-zinc-100 border border-zinc-200" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-white border border-zinc-200" />
          <span>Closed/Full</span>
        </div>
      </div>
      <p className="mt-2 text-xs text-zinc-400">Only Sat &amp; Sun shown &mdash; weekdays are closed.</p>
    </div>
  )
}
