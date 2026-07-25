import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendBookingConfirmation } from "@/lib/email"
import { auth } from "@/lib/auth"
const MAX_PER_SLOT = 10
const HOURLY_RATE = 20
const MEMBER_DISCOUNT = 0.1

const VALID_SLOTS = [
  "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
]
const MAX_DAILY = MAX_PER_SLOT * VALID_SLOTS.length

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dateFilter = searchParams.get("date")
  const monthFilter = searchParams.get("month")

  if (monthFilter) {
    const [year, month] = monthFilter.split("-").map(Number)
    function localDateStr(date: Date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    }

    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59, 999)

    const bookings = await prisma.booking.findMany({
      where: {
        date: { gte: start, lte: end },
        status: { not: "cancelled" },
      },
    })

    const guestsByDate: Record<string, number> = {}
    for (const b of bookings) {
      const key = localDateStr(b.date)
      guestsByDate[key] = (guestsByDate[key] || 0) + b.guests
    }

    const dayCount: Record<string, "full" | "partial" | "open"> = {}
    const d = new Date(start)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    while (d <= end) {
      const key = localDateStr(d)
      const total = guestsByDate[key] || 0
      if (total >= MAX_DAILY) {
        dayCount[key] = "full"
      } else if (total > 0) {
        dayCount[key] = "partial"
      } else if (d < today) {
        dayCount[key] = "full"
      } else {
        dayCount[key] = "open"
      }
      d.setDate(d.getDate() + 1)
    }

    return NextResponse.json(dayCount)
  }

  const where = dateFilter
    ? {
        date: {
          gte: new Date(`${dateFilter}T00:00:00.000Z`),
          lte: new Date(`${dateFilter}T23:59:59.999Z`),
        },
      }
    : {}

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { date: "asc" },
  })

  const capacity = dateFilter ? buildSlotCapacity(bookings) : null

  const session = await auth()
  const isAdmin = session?.user?.role === "admin"

  if (dateFilter && isAdmin) {
    const slotNames: Record<string, { name: string; guests: number }[]> = {}
    for (const b of bookings) {
      if (b.status === "cancelled") continue
      if (!slotNames[b.timeSlot]) slotNames[b.timeSlot] = []
      slotNames[b.timeSlot].push({ name: b.name, guests: b.guests })
    }
    return NextResponse.json({ bookings, capacity, slotNames })
  }

  return NextResponse.json({ bookings, capacity })
}

function buildSlotCapacity(
  bookings: { timeSlot: string; guests: number; status: string }[],
): Record<string, { booked: number; remaining: number }> {
  const map: Record<string, number> = {}
  for (const b of bookings) {
    if (b.status === "cancelled") continue
    map[b.timeSlot] = (map[b.timeSlot] || 0) + b.guests
  }
  const result: Record<string, { booked: number; remaining: number }> = {}
  for (const [slot, total] of Object.entries(map)) {
    result[slot] = { booked: total, remaining: Math.max(0, MAX_PER_SLOT - total) }
  }
  return result
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    if (!data.name || !data.email || !data.date || !data.timeSlot) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const [yr, mo, dy] = data.date.split("-").map(Number)
    const bookingDate = new Date(yr, mo - 1, dy)
    const dayOfWeek = bookingDate.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      return NextResponse.json(
        { error: "We are only open Saturdays and Sundays." },
        { status: 400 },
      )
    }

    if (!VALID_SLOTS.includes(data.timeSlot)) {
      return NextResponse.json(
        { error: "Invalid time slot. We are open 10:00 AM – 4:00 PM on weekends." },
        { status: 400 },
      )
    }

    const guestCount = data.guests || 1
    if (guestCount > MAX_PER_SLOT) {
      return NextResponse.json(
        { error: `Maximum ${MAX_PER_SLOT} guests per time slot.` },
        { status: 400 },
      )
    }

    const dateStart = new Date(`${data.date}T00:00:00.000Z`)
    const dateEnd = new Date(`${data.date}T23:59:59.999Z`)

    const existing = await prisma.booking.findMany({
      where: {
        date: { gte: dateStart, lte: dateEnd },
        timeSlot: data.timeSlot,
        status: { not: "cancelled" },
      },
    })

    const totalGuests = existing.reduce((sum, b) => sum + b.guests, 0)
    if (totalGuests + guestCount > MAX_PER_SLOT) {
      const remaining = MAX_PER_SLOT - totalGuests
      return NextResponse.json(
        { error: `Only ${remaining} spot${remaining === 1 ? "" : "s"} left in this time slot.` },
        { status: 409 },
      )
    }

    const bookingDateLocal = new Date(yr, mo - 1, dy)

    const session = await auth()
    const isMember = !!session?.user?.id
    const effectiveRate = isMember ? Math.round(HOURLY_RATE * (1 - MEMBER_DISCOUNT)) : HOURLY_RATE
    const total = Math.round((data.duration / 60) * effectiveRate * guestCount)

    const booking = await prisma.booking.create({
      data: {
        userId: session?.user?.id || null,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        date: bookingDateLocal,
        timeSlot: data.timeSlot,
        duration: data.duration || 60,
        guests: guestCount,
        type: data.type || "individual",
        notes: data.notes || null,
        total,
      },
    })

    try {
      await sendBookingConfirmation({
        name: data.name,
        email: data.email,
        date: data.date,
        timeSlot: data.timeSlot,
        duration: data.duration || 60,
        guests: guestCount,
        type: data.type || "individual",
        notes: data.notes || null,
      })
    } catch (emailErr) {
      console.error("Failed to send email:", emailErr)
    }

    return NextResponse.json(booking)
  } catch (e) {
    console.error("Booking error:", e)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
