"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardGrid } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, CheckCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"

const sampleEvents = [
  {
    id: "1",
    title: "Weekend Archery Tournament",
    description:
      "Compete in our monthly archery tournament. Prizes for top 3 finishers in each category. All equipment provided — just bring your aim.",
    date: new Date("2026-09-15T10:00:00"),
    endDate: new Date("2026-09-15T16:00:00"),
    location: "",
    maxGuests: 30,
    price: 25,
    type: "tournament",
    status: "upcoming",
    includes: [
      "Equipment rental (bow, arrows, arm guard)",
      "Target fees for all rounds",
      "Light refreshments",
      "Prize pool for top 3",
    ],
    skillLevel: "All levels welcome",
  },
  {
    id: "2",
    title: "Survival Skills Workshop",
    description:
      "Hands-on workshop covering fire starting, shelter building, navigation, water purification, and emergency signaling. Leave with a skill set that lasts a lifetime.",
    date: new Date("2026-09-22T09:00:00"),
    endDate: new Date("2026-09-22T15:00:00"),
    location: "",
    maxGuests: 20,
    price: 50,
    type: "workshop",
    status: "upcoming",
    includes: [
      "All materials and tools provided",
      "Take-home fire starter kit",
      "Survival guide booklet",
      "Lunch included",
    ],
    skillLevel: "Beginner-friendly",
  },
  {
    id: "3",
    title: "Corporate Team Building",
    description:
      "Bring your team for a day of archery challenges, survival exercises, and leadership drills. Custom packages available for groups of 10–50. Strengthen communication, trust, and morale in a unique outdoor setting.",
    date: new Date("2026-10-05T10:00:00"),
    endDate: new Date("2026-10-05T16:00:00"),
    location: "",
    maxGuests: 50,
    price: -1,
    type: "corporate",
    status: "upcoming",
    includes: [
      "Private range access for your team",
      "Guided archery instruction",
      "Team survival challenges",
      "Customizable agenda",
      "Catering options available",
    ],
    skillLevel: "All levels welcome",
  },
  {
    id: "4",
    title: "Saturday Morning Beginner Archery",
    description:
      "Perfect for first-timers! Learn proper stance, nocking, aiming, and release technique from certified instructors. All equipment provided — just show up ready to learn.",
    date: new Date("2026-09-18T09:00:00"),
    endDate: new Date("2026-09-18T12:00:00"),
    location: "",
    maxGuests: 15,
    price: 35,
    type: "workshop",
    status: "upcoming",
    includes: [
      "Beginner bow and arrow set",
      "One-on-one coaching",
      "Range time after lesson",
      "Digital progress photo",
    ],
    skillLevel: "Beginner",
  },
  {
    id: "5",
    title: "Sunday Family Fun Day",
    description:
      "Bring the whole family for a fun afternoon of archery! Kid-friendly bows, games, and competitions. No experience needed — parents and kids learn together.",
    date: new Date("2026-09-19T11:00:00"),
    endDate: new Date("2026-09-19T15:00:00"),
    location: "",
    maxGuests: 25,
    price: 20,
    type: "family",
    status: "upcoming",
    includes: [
      "Equipment for all ages (5+)",
      "Fun archery games & challenges",
      "Family photo at the range",
      "Juice box and snack for kids",
    ],
    skillLevel: "All levels welcome",
  },
  {
    id: "6",
    title: "Weekend Advanced Precision Clinic",
    description:
      "Take your shot to the next level. This clinic focuses on form refinement, distance shooting, mental preparation, and competitive strategy. For archers with at least 3 months experience.",
    date: new Date("2026-09-25T10:00:00"),
    endDate: new Date("2026-09-25T14:00:00"),
    location: "",
    maxGuests: 12,
    price: 45,
    type: "clinic",
    status: "upcoming",
    includes: [
      "Advanced coaching session",
      "Video form analysis",
      "Long-distance target practice",
      "Training plan to take home",
    ],
    skillLevel: "Intermediate+",
  },
  {
    id: "7",
    title: "Saturday Night Glow Archery",
    description:
      "Archery after dark! Neon targets, glowing arrows, and a high-energy atmosphere. Best played with friends. All equipment and glow accessories provided.",
    date: new Date("2026-10-01T19:00:00"),
    endDate: new Date("2026-10-01T22:00:00"),
    location: "",
    maxGuests: 20,
    price: 30,
    type: "social",
    status: "upcoming",
    includes: [
      "Glow-in-the-dark bow & arrows",
      "Neon target setup",
      "Blacklight range atmosphere",
      "Refreshments included",
    ],
    skillLevel: "All levels welcome",
  },
  {
    id: "8",
    title: "Indoor Archery Open Range",
    description:
      "Beat the heat and practice your shot at our climate-controlled indoor range. Multiple target distances, rental equipment available, and coaches on standby. Drop in anytime during the session.",
    date: new Date("2026-10-02T10:00:00"),
    endDate: new Date("2026-10-02T16:00:00"),
    location: "",
    maxGuests: 30,
    price: 20,
    type: "open range",
    status: "upcoming",
    includes: [
      "Indoor lane reservation",
      "Target setup at multiple distances",
      "Bow & arrow rental available",
      "On-site coaching assistance",
    ],
    skillLevel: "All levels welcome",
  },
  {
    id: "9",
    title: "Concealed Pistol License (CPL) Training",
    description:
      "Michigan-compliant CPL training course covering firearm safety, handling, marksmanship fundamentals, and legal requirements for concealed carry. Meets all state education requirements for your CPL application.",
    date: new Date("2026-10-12T09:00:00"),
    endDate: new Date("2026-10-12T17:00:00"),
    location: "",
    maxGuests: 20,
    price: 150,
    type: "training",
    status: "upcoming",
    includes: [
      "8-hour certified instructor-led course",
      "Firearm safety and handling instruction",
      "Range time with live fire practice",
      "Michigan CPL law and legal overview",
      "Certificate of completion for CPL application",
    ],
    skillLevel: "Beginner-friendly",
  },
  {
    id: "10",
    title: "Women's Self-Defense & Firearm Safety",
    description:
      "Empowering women with essential self-defense techniques and firearm safety knowledge. This course covers situational awareness, basic defense tactics, and safe firearm handling in a supportive environment.",
    date: new Date("2026-10-19T09:00:00"),
    endDate: new Date("2026-10-19T14:00:00"),
    location: "",
    maxGuests: 16,
    price: 75,
    type: "training",
    status: "upcoming",
    includes: [
      "Certified self-defense instruction",
      "Situational awareness training",
      "Firearm safety basics",
      "Hands-on practice drills",
      "Take-home safety guide",
    ],
    skillLevel: "All levels welcome",
  },
  {
    id: "11",
    title: "Junior Archery League",
    description:
      "A 4-week program designed for youth ages 8–17. Learn archery fundamentals, build discipline, and compete in friendly matches. Perfect for building confidence and focus in young archers.",
    date: new Date("2026-10-25T10:00:00"),
    endDate: new Date("2026-10-25T12:00:00"),
    location: "",
    maxGuests: 15,
    price: 100,
    type: "training",
    status: "upcoming",
    includes: [
      "4-week structured program",
      "All archery equipment provided",
      "Certified youth instructor",
      "Progress tracking and scoring",
      "Certificate of completion",
    ],
    skillLevel: "Beginner",
  },
  {
    id: "12",
    title: "Outdoor Survival Weekend",
    description:
      "A full weekend immersion into wilderness survival. Learn to build shelter, start fires, find food and water, navigate with a compass, and signal for rescue. Camp overnight and put your skills to the test.",
    date: new Date("2026-11-08T08:00:00"),
    endDate: new Date("2026-11-09T16:00:00"),
    location: "",
    maxGuests: 12,
    price: 200,
    type: "workshop",
    status: "upcoming",
    includes: [
      "Two-day guided survival experience",
      "Shelter building and fire craft",
      "Navigation and map reading",
      "Water sourcing and purification",
      "Overnight camping gear provided",
      "All meals included",
    ],
    skillLevel: "Intermediate",
  },
]

export default function EventsPage() {
  const formRef = useRef<HTMLDivElement>(null)
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

  function registerForEvent(e: typeof sampleEvents[number]) {
    setForm({
      name: "",
      email: "",
      phone: "",
      eventType: e.type,
      preferredDate: e.date.toISOString().split("T")[0],
      preferredTime: "",
      estimatedGuests: 1,
      message: `I want to register for: ${e.title} on ${e.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`,
    })
    formRef.current?.scrollIntoView({ behavior: "smooth" })
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
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>
                    {event.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    {" — "}
                    {event.date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    {" – "}
                    {event.endDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 shrink-0" />
                  <span>Max {event.maxGuests} guests &middot; {event.skillLevel}</span>
                </div>
              </div>

              <details className="group mt-3">
                <summary className="cursor-pointer text-xs font-medium text-amber-600 hover:text-amber-700">
                  What&rsquo;s included
                </summary>
                <ul className="mt-2 space-y-1">
                  {event.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-zinc-500">
                      <span className="mt-0.5 text-amber-500">&bull;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </details>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold text-amber-600">
                  {event.price === -1 ? "Call for pricing" : event.price === 0 ? "Free" : event.type === "training" ? `$${event.price}/person` : `$${event.price}/hour`}
                </span>
                <div className="flex items-center gap-2">
                  {event.id === "9" && (
                    <a href="https://quickshotcpl.com/" target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="text-xs">More Info</Button>
                    </a>
                  )}
                  <Button size="sm" onClick={() => registerForEvent(event)}>Register</Button>
                </div>
              </div>
            </Card>
          ))}
        </CardGrid>
      </section>

      <section ref={formRef} className="mt-20">
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
              <div className="space-y-1">
                <label htmlFor="event-date" className="block text-sm font-medium text-zinc-300">
                  Preferred Date
                </label>
                <input
                  id="event-date"
                  type="date"
                  value={form.preferredDate}
                  onChange={(e) => updateField("preferredDate", e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 [color-scheme:dark]"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="event-guests" className="block text-sm font-medium text-zinc-300">
                  Estimated Guests
                </label>
                <input
                  id="event-guests"
                  type="number"
                  min={1}
                  value={form.estimatedGuests}
                  onChange={(e) => updateField("estimatedGuests", parseInt(e.target.value))}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
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
