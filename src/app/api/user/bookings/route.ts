import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { sendCancellationEmail } from "@/lib/email"

function toDateString(date: Date) {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, "0")
  const d = String(date.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  })
  if (!user?.email) {
    return NextResponse.json({ bookings: [] })
  }

  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { email: user.email },
      ],
    },
    orderBy: { date: "desc" },
  })

  return NextResponse.json({ bookings })
}

const VALID_SLOTS = [
  "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
]
const MAX_PER_SLOT = 10

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { id, date, timeSlot, guests, duration, notes } = body

  if (!id) {
    return NextResponse.json({ error: "Booking ID required" }, { status: 400 })
  }

  const existing = await prisma.booking.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  if (existing.userId !== session.user.id && existing.email !== session.user.email) {
    return NextResponse.json({ error: "Not your booking" }, { status: 403 })
  }

  if (existing.status === "cancelled") {
    return NextResponse.json({ error: "Cannot edit cancelled booking" }, { status: 400 })
  }

  const updateData: Record<string, unknown> = {}

  if (date) {
    const [yr, mo, dy] = date.split("-").map(Number)
    const bookingDate = new Date(yr, mo - 1, dy)
    const dayOfWeek = bookingDate.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      return NextResponse.json({ error: "We are only open Saturdays and Sundays." }, { status: 400 })
    }
    updateData.date = bookingDate
  }

  if (timeSlot) {
    if (!VALID_SLOTS.includes(timeSlot)) {
      return NextResponse.json({ error: "Invalid time slot." }, { status: 400 })
    }
    updateData.timeSlot = timeSlot
  }

  if (guests) {
    if (guests > MAX_PER_SLOT) {
      return NextResponse.json({ error: `Maximum ${MAX_PER_SLOT} guests per slot.` }, { status: 400 })
    }
    updateData.guests = guests

    const checkDate = (updateData.date as Date) || existing.date
    const checkSlot = (updateData.timeSlot as string) || existing.timeSlot

    const dateStart = new Date(checkDate)
    dateStart.setHours(0, 0, 0, 0)
    const dateEnd = new Date(checkDate)
    dateEnd.setHours(23, 59, 59, 999)

    const others = await prisma.booking.findMany({
      where: {
        id: { not: id },
        date: { gte: dateStart, lte: dateEnd },
        timeSlot: checkSlot,
        status: { not: "cancelled" },
      },
    })
    const totalOthers = others.reduce((sum, b) => sum + b.guests, 0)
    if (totalOthers + guests > MAX_PER_SLOT) {
      return NextResponse.json(
        { error: `Only ${MAX_PER_SLOT - totalOthers} spots left in this time slot.` },
        { status: 409 },
      )
    }
  }

  if (duration) updateData.duration = duration
  if (notes !== undefined) updateData.notes = notes || null

  const updated = await prisma.booking.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Booking ID required" }, { status: 400 })
  }

  const existing = await prisma.booking.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  if (existing.userId !== session.user.id && existing.email !== session.user.email) {
    return NextResponse.json({ error: "Not your booking" }, { status: 403 })
  }

  await prisma.booking.update({
    where: { id },
    data: { status: "cancelled" },
  })

  try {
    await sendCancellationEmail({
      name: existing.name,
      email: existing.email,
      date: toDateString(existing.date),
      timeSlot: existing.timeSlot,
      duration: existing.duration,
      guests: existing.guests,
      type: existing.type,
      cancelledBy: "user",
    })
  } catch (err) {
    console.error("Failed to send cancellation email:", err)
  }

  return NextResponse.json({ success: true })
}
