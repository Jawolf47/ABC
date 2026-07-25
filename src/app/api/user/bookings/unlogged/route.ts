import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { sendProgressReminder } from "@/lib/email"

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

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { email: user.email },
      ],
      status: { not: "cancelled" },
      date: { lt: today },
    },
    orderBy: { date: "desc" },
  })

  const loggedBookingIds = new Set(
    (
      await prisma.shootingProgress.findMany({
        where: {
          userId: session.user.id,
          bookingId: { not: null },
        },
        select: { bookingId: true },
      })
    ).map((p) => p.bookingId)
  )

  const unlogged = bookings.filter((b) => !loggedBookingIds.has(b.id))

  for (const b of unlogged) {
    try {
      await sendProgressReminder({
        name: b.name,
        email: b.email,
        date: toDateString(b.date),
        timeSlot: b.timeSlot,
        type: b.type,
      })
    } catch {
      // continue even if email fails
    }
  }

  return NextResponse.json({ bookings: unlogged })
}
