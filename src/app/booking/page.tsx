"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Calendar, Clock, Users, ArrowRight, CheckCircle } from "lucide-react"

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM",
]

const durations = [30, 60, 90, 120]

export default function BookingPage() {
  const [step, setStep] = useState(1)
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setStep(3)
    }
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
        <Button className="mt-8" onClick={() => { setStep(1); setForm({ name: "", email: "", phone: "", date: "", timeSlot: "", duration: 60, guests: 1, type: "individual", notes: "" }) }}>
          Book Another Session
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Book a Session
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          Reserve your lane for individual practice or plan a group event.
        </p>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                step >= s
                  ? "bg-amber-600 text-white"
                  : "bg-zinc-200 text-zinc-500"
              }`}
            >
              {s}
            </div>
            <span className={`text-sm ${step >= s ? "text-zinc-900 font-medium" : "text-zinc-500"}`}>
              {s === 1 ? "Details" : "Confirm"}
            </span>
          </div>
        ))}
      </div>

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
              <Input
                label="Number of Guests"
                id="guests"
                type="number"
                min={1}
                max={20}
                value={form.guests}
                onChange={(e) => updateField("guests", parseInt(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">Date</label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => updateField("date", e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">Time Slot</label>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => updateField("timeSlot", slot)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                      form.timeSlot === slot
                        ? "border-amber-600 bg-amber-50 text-amber-700"
                        : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
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
            <div className="rounded-lg bg-zinc-50 p-4 space-y-3">
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
                <span className="text-zinc-600">{form.guests} guest(s)</span>
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
          </div>
        </Card>
      )}
    </div>
  )
}
