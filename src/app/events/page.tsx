"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardGrid } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, MapPin, Clock, CheckCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"

const sampleEvents = [
  {
    id: "1",
    title: "Weekend Archery Tournament",
    description: "Compete in our monthly archery tournament. Prizes for top 3 finishers in each category.",
    date: new Date("2026-07-15T10:00:00"),
    maxGuests: 30,
    price: 25,
    type: "tournament",
    status: "upcoming",
  },
  {
    id: "2",
    title: "Survival Skills Workshop",
    description: "Learn essential bushcraft skills including fire starting, shelter building, and navigation.",
    date: new Date("2026-07-22T09:00:00"),
    maxGuests: 20,
    price: 50,
    type: "workshop",
    status: "upcoming",
  },
  {
    id: "3",
    title: "Corporate Team Building",
    description: "Bring your team for a day of archery challenges and survival exercises. Custom packages available.",
    date: new Date("2026-08-05T10:00:00"),
    maxGuests: 50,
    price: 0,
    type: "corporate",
    status: "upcoming",
  },
]

export default function EventsPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "corporate",
    preferredDate: "",
    preferredTime: "",
    estimatedGuests: 10,
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  function updateField(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-zinc-900">Event Inquiry Sent!</h1>
        <p className="mt-4 text-lg text-zinc-600">
          We will reach out within 24 hours to finalize your event details.
        </p>
        <Button className="mt-8" onClick={() => setSubmitted(false)}>
          Plan Another Event
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Group Events
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          Plan your group outing, corporate event, or celebration at the range.
        </p>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-bold text-zinc-900">Upcoming Events</h2>
        <p className="mt-2 text-zinc-600">Join one of our scheduled group events.</p>
        <CardGrid className="mt-8">
          {sampleEvents.map((event) => (
            <Card key={event.id} className="flex flex-col">
              <Badge variant="primary" className="mb-3 w-fit capitalize">
                {event.type}
              </Badge>
              <h3 className="text-xl font-semibold text-zinc-900">{event.title}</h3>
              <p className="mt-2 flex-1 text-sm text-zinc-600">{event.description}</p>
              <div className="mt-4 space-y-2 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {event.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Max {event.maxGuests} guests
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold text-amber-600">
                  {event.price === 0 ? "Free" : `$${event.price}/person`}
                </span>
                <Button size="sm">Register</Button>
              </div>
            </Card>
          ))}
        </CardGrid>
      </section>

      <section className="mt-20">
        <div className="rounded-2xl bg-zinc-900 p-8 sm:p-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Plan Your Private Event
          </h2>
          <p className="mt-2 text-zinc-400">
            Birthdays, bachelor parties, corporate outings, or private lessons. Tell us what you need.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Your Name"
                id="event-name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
              <Input
                label="Email"
                id="event-email"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
              />
              <Input
                label="Phone"
                id="event-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-zinc-300">Event Type</label>
                <select
                  value={form.eventType}
                  onChange={(e) => updateField("eventType", e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="corporate">Corporate Event</option>
                  <option value="birthday">Birthday Party</option>
                  <option value="bachelor">Bachelor/Bachelorette</option>
                  <option value="private">Private Lesson Group</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Input
                label="Preferred Date"
                id="event-date"
                type="date"
                value={form.preferredDate}
                onChange={(e) => updateField("preferredDate", e.target.value)}
              />
              <Input
                label="Estimated Guests"
                id="event-guests"
                type="number"
                min={1}
                value={form.estimatedGuests}
                onChange={(e) => updateField("estimatedGuests", parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300">Tell us about your event</label>
              <textarea
                value={form.message}
                onChange={(e) => updateField("message", e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white transition-colors placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                rows={4}
                placeholder="Describe what you are looking for, any special requirements, etc."
                required
              />
            </div>
            <Button size="lg" type="submit" className="w-full sm:w-auto">
              Send Inquiry
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}
