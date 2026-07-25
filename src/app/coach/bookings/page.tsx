"use client"

import { useEffect, useState } from "react"
import { Loader2, Filter, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Booking {
  id: string; name: string; email: string; phone: string | null
  date: string; timeSlot: string; duration: number; guests: number
  type: string; status: string; payment: string; total: number | null
  notes: string | null; createdAt: string
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  return new Date(`${y}-${m}-${day}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

export default function CoachBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams()
    if (filterDate) params.set("date", filterDate)
    if (filterStatus) params.set("status", filterStatus)
    fetch(`/api/coach/bookings?${params}`)
      .then((r) => r.json())
      .then((data) => { setBookings(data.bookings || []); setLoading(false) })
  }, [filterDate, filterStatus])

  const statusColor = (s: string) => s === "confirmed" ? "bg-green-900/50 text-green-400" : s === "cancelled" ? "bg-red-900/50 text-red-400" : "bg-zinc-800 text-zinc-400"
  const paymentColor = (p: string) => p === "paid" ? "bg-green-900/50 text-green-400" : p === "partial" ? "bg-yellow-900/50 text-yellow-400" : "bg-red-900/50 text-red-400"

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Bookings</h1>
      <p className="mt-1 text-sm text-zinc-400">View all reservations. Read-only access.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-500" />
          <span className="text-sm text-zinc-400">Filter:</span>
        </div>
        <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-40 border-zinc-700 bg-zinc-800 text-sm text-white" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white">
          <option value="">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {(filterDate || filterStatus) && (
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white" onClick={() => { setFilterDate(""); setFilterStatus("") }}>Clear</Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-amber-500" /></div>
      ) : bookings.length === 0 ? (
        <div className="py-20 text-center text-zinc-500">No bookings found.</div>
      ) : (
        <div className="mt-6 space-y-2">
          {bookings.map((b) => {
            const isExpanded = expandedId === b.id
            return (
              <div key={b.id} className="rounded-lg border border-zinc-800 bg-zinc-900">
                <div className="flex cursor-pointer items-center justify-between px-4 py-3 transition-colors hover:bg-zinc-800/50" onClick={() => setExpandedId(isExpanded ? null : b.id)}>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-medium text-white">{formatDate(b.date)}</span>
                    <span className="text-amber-400">{b.timeSlot}</span>
                    <span className="text-sm text-zinc-400">{b.name}</span>
                    <span className="text-sm text-zinc-400">{b.guests} shooter{b.guests > 1 ? "s" : ""}</span>
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusColor(b.status)}`}>{b.status}</span>
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${paymentColor(b.payment)}`}>{b.payment}</span>
                    {b.total != null && <span className="text-sm text-zinc-400">${b.total}</span>}
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                </div>
                {isExpanded && (
                  <div className="border-t border-zinc-800 px-4 py-4">
                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                      <div><span className="text-zinc-500">Email:</span> <span className="text-white">{b.email}</span></div>
                      {b.phone && <div><span className="text-zinc-500">Phone:</span> <span className="text-white">{b.phone}</span></div>}
                      <div><span className="text-zinc-500">Type:</span> <span className="text-white">{b.type}</span></div>
                      <div><span className="text-zinc-500">Duration:</span> <span className="text-white">{b.duration} min</span></div>
                      {b.notes && <div className="sm:col-span-2"><span className="text-zinc-500">Notes:</span> <span className="text-white">{b.notes}</span></div>}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
