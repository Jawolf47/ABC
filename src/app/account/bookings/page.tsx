"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2, Check, Calendar, X, Pencil, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Booking {
  id: string
  name: string
  email: string
  phone: string | null
  date: string
  timeSlot: string
  duration: number
  guests: number
  type: string
  status: string
  notes: string | null
}

const VALID_SLOTS = [
  "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
]

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  const dt = new Date(`${y}-${m}-${day}T12:00:00`)
  return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
}

function toDateString(dateStr: string) {
  const d = new Date(dateStr)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export default function BookingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [editingBooking, setEditingBooking] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ date: string; timeSlot: string; guests: number }>({ date: "", timeSlot: "", guests: 1 })
  const [editSaving, setEditSaving] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [showPast, setShowPast] = useState(false)

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/user/bookings")
      const data = await res.json()
      setBookings(data.bookings || [])
    } catch {
      // ignore
    } finally {
      setBookingsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }
    if (session?.user) {
      fetchBookings()
    }
  }, [session, status, router, fetchBookings])

  const startEdit = (b: Booking) => {
    setEditingBooking(b.id)
    setEditForm({ date: toDateString(b.date), timeSlot: b.timeSlot, guests: b.guests })
  }

  const saveEdit = async (id: string) => {
    setEditSaving(true)
    try {
      const res = await fetch("/api/user/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...editForm }),
      })
      if (res.ok) {
        setEditingBooking(null)
        fetchBookings()
      }
    } finally {
      setEditSaving(false)
    }
  }

  const cancelBooking = async (id: string) => {
    setCancellingId(id)
    try {
      const res = await fetch(`/api/user/bookings?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchBookings()
      }
    } finally {
      setCancellingId(null)
    }
  }

  if (status === "loading" || bookingsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const activeBookings = bookings.filter((b) => b.status !== "cancelled" && new Date(b.date) >= today)
  const pastBookings = bookings.filter((b) => b.status === "cancelled" || new Date(b.date) < today)

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">My Bookings</h1>
          <p className="mt-2 text-zinc-400">View, edit, or cancel your upcoming sessions.</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-white">Upcoming</h2>
          </div>
          {activeBookings.length === 0 && pastBookings.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-zinc-500">No bookings yet.</p>
              <Button
                variant="ghost"
                className="mt-3 text-amber-500 hover:text-amber-400"
                onClick={() => router.push("/booking")}
              >
                Book a Session
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeBookings.length > 0 && activeBookings.map((b) => (
                <div key={b.id} className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                  {editingBooking === b.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <label className="text-xs text-zinc-500">Date</label>
                          <Input
                            type="date"
                            value={editForm.date}
                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                            className="border-zinc-600 bg-zinc-900 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-500">Time Slot</label>
                          <select
                            value={editForm.timeSlot}
                            onChange={(e) => setEditForm({ ...editForm, timeSlot: e.target.value })}
                            className="flex h-10 w-full rounded-md border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-white"
                          >
                            {VALID_SLOTS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-zinc-500">Guests</label>
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            value={editForm.guests}
                            onChange={(e) => setEditForm({ ...editForm, guests: parseInt(e.target.value) || 1 })}
                            className="border-zinc-600 bg-zinc-900 text-white"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700"
                          onClick={() => saveEdit(b.id)}
                          disabled={editSaving}
                        >
                          {editSaving ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Check className="mr-1 h-3 w-3" />}
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-zinc-400 hover:text-white"
                          onClick={() => setEditingBooking(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{formatDate(b.date)}</span>
                          <span className="text-zinc-500">·</span>
                          <span className="text-amber-400">{b.timeSlot}</span>
                        </div>
                        <div className="mt-1 text-sm text-zinc-500">
                          {b.guests} guest{b.guests > 1 ? "s" : ""} · {b.duration} min · {b.type}
                        </div>
                        {b.notes && <p className="mt-1 text-xs text-zinc-600">{b.notes}</p>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(b)}
                          className="rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-white"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => cancelBooking(b.id)}
                          disabled={cancellingId === b.id}
                          className="rounded-md p-2 text-zinc-500 transition-colors hover:bg-red-900/50 hover:text-red-400"
                          title="Cancel"
                        >
                          {cancellingId === b.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {activeBookings.length === 0 && (
                <div className="py-4 text-center">
                  <p className="text-zinc-500">No upcoming bookings.</p>
                  <Button
                    variant="ghost"
                    className="mt-3 text-amber-500 hover:text-amber-400"
                    onClick={() => router.push("/booking")}
                  >
                    Book a Session
                  </Button>
                </div>
              )}

              {pastBookings.length > 0 && (
                <>
                  <button
                    onClick={() => setShowPast(!showPast)}
                    className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-400"
                  >
                    {showPast ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    Past & Cancelled ({pastBookings.length})
                  </button>
                  {showPast && pastBookings.map((b) => (
                    <div key={b.id} className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 opacity-60">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white">{formatDate(b.date)}</span>
                            <span className="text-zinc-600">·</span>
                            <span className="text-zinc-500">{b.timeSlot}</span>
                            {b.status === "cancelled" && (
                              <span className="rounded bg-red-900/50 px-2 py-0.5 text-xs text-red-400">Cancelled</span>
                            )}
                          </div>
                          <div className="mt-1 text-sm text-zinc-600">
                            {b.guests} guest{b.guests > 1 ? "s" : ""} · {b.duration} min
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
