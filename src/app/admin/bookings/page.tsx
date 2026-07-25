"use client"

import { useEffect, useState } from "react"
import { Loader2, Search, Filter, Pencil, X, Check, DollarSign, ChevronDown, ChevronUp } from "lucide-react"
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
  payment: string
  total: number | null
  notes: string | null
  userId: string | null
  createdAt: string
}

const VALID_SLOTS = ["10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"]

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  const dt = new Date(`${y}-${m}-${day}T12:00:00`)
  return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

function toDateString(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterPayment, setFilterPayment] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ date: "", timeSlot: "", guests: 1, duration: 60, notes: "" })
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [payingId, setPayingId] = useState<string | null>(null)
  const [payForm, setPayForm] = useState({ amount: "", method: "cash" })

  const fetchBookings = () => {
    const params = new URLSearchParams()
    if (filterDate) params.set("date", filterDate)
    if (filterStatus) params.set("status", filterStatus)
    if (filterPayment) params.set("payment", filterPayment)
    fetch(`/api/admin/bookings?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setBookings(data.bookings || [])
        setLoading(false)
      })
  }

  useEffect(() => {
    setLoading(true)
    fetchBookings()
  }, [filterDate, filterStatus, filterPayment])

  const startEdit = (b: Booking) => {
    setEditingId(b.id)
    setEditForm({
      date: toDateString(b.date),
      timeSlot: b.timeSlot,
      guests: b.guests,
      duration: b.duration,
      notes: b.notes || "",
    })
  }

  const saveEdit = async (id: string) => {
    setSaving(true)
    await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...editForm }),
    })
    setEditingId(null)
    setSaving(false)
    fetchBookings()
  }

  const updatePayment = async (id: string, payment: string, total?: number) => {
    await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, payment, total }),
    })
    fetchBookings()
  }

  const cancelBooking = async (id: string) => {
    await fetch(`/api/admin/bookings?id=${id}`, { method: "DELETE" })
    fetchBookings()
  }

  const statusColor = (s: string) => {
    if (s === "confirmed") return "bg-green-900/50 text-green-400"
    if (s === "cancelled") return "bg-red-900/50 text-red-400"
    return "bg-zinc-800 text-zinc-400"
  }

  const paymentColor = (p: string) => {
    if (p === "paid") return "bg-green-900/50 text-green-400"
    if (p === "partial") return "bg-yellow-900/50 text-yellow-400"
    return "bg-red-900/50 text-red-400"
  }

  const sortedBookings = [...bookings].sort((a, b) => {
    const statusOrder: Record<string, number> = { confirmed: 0, cancelled: 1 }
    const sa = statusOrder[a.status] ?? 2
    const sb = statusOrder[b.status] ?? 2
    if (sa !== sb) return sa - sb
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Bookings</h1>
      <p className="mt-1 text-sm text-zinc-400">Manage all reservations and payments.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-500" />
          <span className="text-sm text-zinc-400">Filter:</span>
        </div>
        <Input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="w-40 border-zinc-700 bg-zinc-800 text-sm text-white"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
        >
          <option value="">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
        >
          <option value="">All Payments</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>
        {(filterDate || filterStatus || filterPayment) && (
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white"
            onClick={() => { setFilterDate(""); setFilterStatus(""); setFilterPayment("") }}
          >
            Clear
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      ) : sortedBookings.length === 0 ? (
        <div className="py-20 text-center text-zinc-500">No bookings found.</div>
      ) : (
        <div className="mt-6 space-y-2">
          {sortedBookings.map((b) => {
            const isEditing = editingId === b.id
            const isExpanded = expandedId === b.id
            return (
              <div key={b.id} className="rounded-lg border border-zinc-800 bg-zinc-900">
                <div
                  className="flex cursor-pointer items-center gap-2 px-3 py-3 transition-colors hover:bg-zinc-800/50 sm:gap-6 sm:px-4"
                  onClick={() => setExpandedId(isExpanded ? null : b.id)}
                >
                  <span className="w-20 shrink-0 truncate font-medium text-white sm:w-24">{formatDate(b.date)}</span>
                  <span className="hidden w-20 shrink-0 text-sm text-amber-400 sm:block">{b.timeSlot}</span>
                  <span className="w-24 shrink-0 truncate text-sm text-zinc-400 sm:w-32">{b.name}</span>
                  <span className="hidden shrink-0 text-sm text-zinc-400 sm:block">{b.guests} shooter{b.guests > 1 ? "s" : ""}</span>
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium sm:px-2 ${statusColor(b.status)}`}>{b.status}</span>
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium sm:px-2 ${paymentColor(b.payment)}`}>{b.payment}</span>
                  <div className="flex-1" />
                  {b.total != null && <span className="hidden shrink-0 text-sm font-medium text-zinc-300 sm:block">${Number(b.total).toFixed(2)}</span>}
                  <button
                    onClick={(e) => { e.stopPropagation(); startEdit(b) }}
                    className="shrink-0 rounded p-1.5 text-zinc-500 hover:bg-zinc-700 hover:text-white"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {isExpanded ? <ChevronUp className="h-4 w-4 shrink-0 text-zinc-500" /> : <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" />}
                </div>

                {isExpanded && !isEditing && (
                  <div className="border-t border-zinc-800 px-4 py-4">
                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                      <div className="flex justify-between rounded bg-zinc-800/50 px-3 py-2"><span className="text-zinc-500">Name</span><span className="text-white">{b.name}</span></div>
                      <div className="flex justify-between rounded bg-zinc-800/50 px-3 py-2"><span className="text-zinc-500">Email</span><span className="text-white truncate ml-2 text-right">{b.email}</span></div>
                      {b.phone && <div className="flex justify-between rounded bg-zinc-800/50 px-3 py-2"><span className="text-zinc-500">Phone</span><span className="text-white">{b.phone}</span></div>}
                      <div className="flex justify-between rounded bg-zinc-800/50 px-3 py-2"><span className="text-zinc-500">Type</span><span className="text-white capitalize">{b.type}</span></div>
                      <div className="flex justify-between rounded bg-zinc-800/50 px-3 py-2"><span className="text-zinc-500">Duration</span><span className="text-white">{b.duration} min</span></div>
                      <div className="flex justify-between rounded bg-zinc-800/50 px-3 py-2"><span className="text-zinc-500">Total</span><span className="text-white">{b.total != null ? `$${Number(b.total).toFixed(2)}` : "—"}</span></div>
                      {b.userId && <div className="flex justify-between rounded bg-zinc-800/50 px-3 py-2"><span className="text-zinc-500">User ID</span><span className="text-white font-mono text-xs truncate ml-2 text-right">{b.userId}</span></div>}
                      <div className="flex justify-between rounded bg-zinc-800/50 px-3 py-2"><span className="text-zinc-500">Created</span><span className="text-white">{new Date(b.createdAt).toLocaleDateString()}</span></div>
                      {b.notes && <div className="sm:col-span-2 flex justify-between rounded bg-zinc-800/50 px-3 py-2"><span className="text-zinc-500">Notes</span><span className="text-white truncate ml-2 text-right">{b.notes}</span></div>}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {payingId === b.id ? (
                        <div className="flex w-full flex-wrap items-end gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
                          <div>
                            <label className="text-xs text-zinc-500">Amount ($)</label>
                            <Input
                              type="number"
                              min={0}
                              step={0.01}
                              value={payForm.amount}
                              onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                              className="h-8 w-24 border-zinc-600 bg-zinc-900 text-sm text-white"
                              placeholder="0.00"
                              autoFocus
                            />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500">Method</label>
                            <select
                              value={payForm.method}
                              onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}
                              className="flex h-8 rounded-md border border-zinc-600 bg-zinc-900 px-2 text-xs text-white"
                            >
                              <option value="cash">Cash</option>
                              <option value="card">Card</option>
                              <option value="venmo">Venmo</option>
                              <option value="zelle">Zelle</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <Button
                            size="sm"
                            className="h-8 bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              const amt = parseFloat(payForm.amount)
                              if (amt > 0) {
                                updatePayment(b.id, "paid", amt)
                                setPayingId(null)
                                setPayForm({ amount: "", method: "cash" })
                              }
                            }}
                          >
                            <Check className="mr-1 h-3 w-3" /> Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-zinc-400 hover:text-white"
                            onClick={() => setPayingId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          {b.payment !== "paid" && b.status !== "cancelled" && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => setPayingId(b.id)}
                            >
                              <DollarSign className="mr-1 h-3 w-3" /> Capture Payment
                            </Button>
                          )}
                          {b.payment === "paid" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-yellow-400 hover:bg-yellow-900/30 hover:text-yellow-300"
                              onClick={() => updatePayment(b.id, "unpaid")}
                            >
                              Mark Unpaid
                            </Button>
                          )}
                        </>
                      )}
                      {b.status !== "cancelled" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:bg-red-900/30 hover:text-red-300"
                          onClick={() => cancelBooking(b.id)}
                        >
                          <X className="mr-1 h-3 w-3" /> Cancel Booking
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="border-t border-zinc-800 px-4 py-4">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                      <div>
                        <label className="text-xs text-zinc-500">Date</label>
                        <Input
                          type="date"
                          value={editForm.date}
                          onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                          className="border-zinc-600 bg-zinc-800 text-sm text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500">Time Slot</label>
                        <select
                          value={editForm.timeSlot}
                          onChange={(e) => setEditForm({ ...editForm, timeSlot: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white"
                        >
                          {VALID_SLOTS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500">Shooters</label>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          value={editForm.guests}
                          onChange={(e) => setEditForm({ ...editForm, guests: parseInt(e.target.value) || 1 })}
                          className="border-zinc-600 bg-zinc-800 text-sm text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500">Duration (min)</label>
                        <Input
                          type="number"
                          min={60}
                          step={60}
                          value={editForm.duration}
                          onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) || 60 })}
                          className="border-zinc-600 bg-zinc-800 text-sm text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500">Notes</label>
                        <Input
                          value={editForm.notes}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          className="border-zinc-600 bg-zinc-800 text-sm text-white"
                          placeholder="Notes"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => saveEdit(b.id)} disabled={saving}>
                        {saving ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Check className="mr-1 h-3 w-3" />}
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
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
