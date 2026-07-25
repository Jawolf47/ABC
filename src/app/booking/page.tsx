"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { BookingCalendar } from "@/components/booking/calendar"
import { Calendar, Clock, Users, ArrowRight, CheckCircle, XCircle, DollarSign } from "lucide-react"

const timeSlots = [
  "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
]

const durations = [60]
const HOURLY_RATE = 20
const MEMBER_DISCOUNT = 0.1
const WEEKEND_DAYS = [0, 6] // Sunday, Saturday

type SlotCapacity = Record<string, { booked: number; remaining: number }>
type SlotNames = Record<string, { name: string; guests: number }[]>

export default function BookingPage() {
  const { data: session } = useSession()
  const [step, setStep] = useState(1)
  const [slotCapacity, setSlotCapacity] = useState<SlotCapacity | null>(null)
  const [slotNames, setSlotNames] = useState<SlotNames>({})
  const isAdmin = (session?.user as { role?: string })?.role === "admin"
  const [error, setError] = useState("")
  const effectiveRate = session ? Math.round(HOURLY_RATE * (1 - MEMBER_DISCOUNT)) : HOURLY_RATE
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    timeSlot: "",
    duration: 60,
    guests: 1,
    type: "individual",
    notes: "",
  })

  function updateField(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    if (!form.date) {
      setSlotCapacity(null)
      return
    }
    const [y, m, d] = form.date.split("-").map(Number)
    const day = new Date(y, m - 1, d).getDay()
    if (!WEEKEND_DAYS.includes(day)) {
      setError("We are only open Saturdays and Sundays.")
      updateField("timeSlot", "")
      setSlotCapacity({})
      return
    }
    setError("")
    fetch(`/api/bookings?date=${form.date}`)
      .then((r) => r.json())
      .then((res) => {
        setSlotCapacity(res.capacity ?? {})
        setSlotNames(res.slotNames ?? {})
        if (res.capacity) {
          const current = res.capacity[form.timeSlot]
          if (current && current.remaining <= 0) {
            updateField("timeSlot", "")
          }
        }
      })
  }, [form.date])

  function slotRemaining(slot: string): number {
    return slotCapacity?.[slot]?.remaining ?? 10
  }

  function maxGuestsForSlot(): number {
    if (!form.timeSlot) return 10
    return Math.min(10, slotRemaining(form.timeSlot) || 10)
  }

  function estimatedCost(): number {
    return Math.round((form.duration / 60) * effectiveRate * form.guests)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setStep(3)
    } else {
      const body = await res.json()
      setError(body.error || "Something went wrong. Please try again.")
    }
  }

  function handleDateSelect(date: string) {
    updateField("date", date)
  }

  if (step === 3) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-zinc-900">Booking Confirmed!</h1>
        <p className="mt-4 text-lg text-zinc-600">
          We have sent a confirmation to {form.email}. See you at the range!
        </p>
        <Button className="mt-8" onClick={() => { setStep(1); setForm({ name: "", email: "", phone: "", date: "", timeSlot: "", duration: 60, guests: 1, type: "individual", notes: "" }); setSlotCapacity(null) }}>
          Book Another Session
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Book a Session
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          Reserve your lane for individual practice or plan a group event.
        </p>
        <p className="mt-2 text-sm text-amber-600">
          Open Saturdays &amp; Sundays &middot; 10:00 AM – 4:00 PM
        </p>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                step >= s ? "bg-amber-600 text-white" : "bg-zinc-200 text-zinc-500"
              }`}
            >
              {s}
            </div>
            <span className={`text-sm ${step >= s ? "font-medium text-zinc-900" : "text-zinc-500"}`}>
              {s === 1 ? "Details" : "Confirm"}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="order-2 lg:order-1 lg:col-span-2">
          {step === 1 && (
            <Card className="mt-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">Session Type</h2>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {[
                      { value: "individual", label: "Individual", desc: "Practice on your own" },
                      { value: "group", label: "Group", desc: "Bring friends or team" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateField("type", opt.value)}
                        className={`rounded-xl border-2 p-4 text-left transition-all ${
                          form.type === opt.value
                            ? "border-amber-600 bg-amber-50"
                            : "border-zinc-200 hover:border-zinc-300"
                        }`}
                      >
                        <p className="font-semibold text-zinc-900">{opt.label}</p>
                        <p className="mt-1 text-sm text-zinc-500">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Your Name"
                    id="name"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    required
                  />
                  <Input
                    label="Email"
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    required
                  />
                  <Input
                    label="Phone"
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                  <div>
                    <Input
                      label="Number of Shooters (including you)"
                      id="guests"
                      type="number"
                      min={1}
                      max={maxGuestsForSlot()}
                      value={form.guests}
                      onChange={(e) => updateField("guests", Math.min(maxGuestsForSlot(), parseInt(e.target.value) || 1))}
                    />
                    <p className="mt-1 text-xs text-zinc-400">Only count people who will be shooting. Audience members don&apos;t need a spot.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    Date
                  </label>
                  <p className="mt-1 text-sm text-zinc-500">Select on the calendar →</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    Time Slot
                    {form.date && slotCapacity && (
                        <span className="ml-2 font-normal text-zinc-400">
                          ({Object.values(slotCapacity).filter((c) => c.remaining > 0).length} of {timeSlots.length} slots open)
                        </span>
                    )}
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {timeSlots.map((slot) => {
                      const booked = slotCapacity?.[slot]?.booked ?? 0
                      const remaining = slotRemaining(slot)
                      const isFull = remaining <= 0
                      const isSelected = form.timeSlot === slot
                      const names = slotNames[slot] || []
                      return (
                        <div key={slot}>
                          <button
                            type="button"
                            disabled={isFull}
                            onClick={() => {
                              if (!isFull) updateField("timeSlot", slot)
                            }}
                            className={`w-full rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                              isFull
                                ? "cursor-not-allowed border-zinc-100 bg-zinc-50 text-zinc-300"
                                : isSelected
                                  ? "border-amber-600 bg-amber-50 text-amber-700"
                                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                            }`}
                          >
                            <div>{slot}</div>
                            {isFull ? (
                              <div className="text-[10px]">Full</div>
                            ) : (
                              <div className="text-[10px] text-zinc-400">
                                {booked > 0 ? `${booked} booked` : "Open"} &middot; {remaining} left
                              </div>
                            )}
                          </button>
                          {isAdmin && names.length > 0 && (
                            <div className="mt-1 rounded bg-amber-50 px-2 py-1 text-[10px] text-amber-700">
                              {names.map((n) => `${n.name} (${n.guests})`).join(", ")}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700">Duration</label>
                  <div className="mt-2 flex gap-2">
                    {durations.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => updateField("duration", d)}
                        className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                          form.duration === d
                            ? "border-amber-600 bg-amber-50 text-amber-700"
                            : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                        }`}
                      >
                        {d} min
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-amber-50 p-4">
                  <div className="flex items-center gap-2 text-sm text-amber-800">
                    <DollarSign className="h-4 w-4" />
                    {session ? (
                      <span className="font-medium">
                        <span className="text-zinc-400 line-through">${HOURLY_RATE}</span> ${effectiveRate}/hour per person
                        <span className="ml-1 rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">Member</span>
                      </span>
                    ) : (
                      <span className="font-medium">${HOURLY_RATE}/hour per person</span>
                    )}
                    <span className="text-amber-600">
                      &mdash; Est. <strong>${estimatedCost()}</strong> for {form.duration} min &times; {form.guests} shooter{form.guests > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700">Notes (optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm transition-colors placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    rows={3}
                    placeholder="Any special requests or equipment needs..."
                  />
                </div>

                <Button className="w-full gap-2" size="lg" onClick={() => setStep(2)}>
                  Continue to Review <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className="mt-8">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-zinc-900">Review Your Booking</h2>
                <div className="space-y-3 rounded-lg bg-zinc-50 p-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-600">{form.type === "group" ? "Group" : "Individual"} Session</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-600">{form.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-600">{form.timeSlot} ({form.duration} min)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-600">{form.guests} shooter{form.guests > 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <DollarSign className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-600">Est. ${estimatedCost()}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-zinc-600">
                  <p>Name: {form.name}</p>
                  <p>Email: {form.email}</p>
                  {form.phone && <p>Phone: {form.phone}</p>}
                  {form.notes && <p>Notes: {form.notes}</p>}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    Edit
                  </Button>
                  <Button className="flex-1" onClick={handleSubmit}>
                    Confirm Booking
                  </Button>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
            </Card>
          )}
        </div>

        <div className="order-1 lg:order-2">
          <div className="sticky top-24">
            <p className="mb-3 text-sm font-medium text-zinc-700">Select a date</p>
            <BookingCalendar selectedDate={form.date} onSelect={handleDateSelect} />
          </div>
        </div>
      </div>
    </div>
  )
}
