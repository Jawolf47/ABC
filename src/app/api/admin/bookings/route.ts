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

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "admin") {
    return null
  }
  return session
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const date = searchParams.get("date")
  const payment = searchParams.get("payment")

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (payment) where.payment = payment
  if (date) {
    const [y, m, d] = date.split("-").map(Number)
    const start = new Date(y, m - 1, d)
    const end = new Date(y, m - 1, d, 23, 59, 59, 999)
    where.date = { gte: start, lte: end }
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: [{ date: "desc" }, { timeSlot: "asc" }],
  })

  return NextResponse.json({ bookings })
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const body = await req.json()
  const { id, ...updates } = body

  if (!id) return NextResponse.json({ error: "Booking ID required" }, { status: 400 })

  const allowed = ["status", "payment", "timeSlot", "guests", "duration", "notes", "total", "date"]
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      if (key === "date" && typeof updates[key] === "string") {
        const [y, m, d] = updates[key].split("-").map(Number)
        data.date = new Date(y, m - 1, d)
      } else {
        data[key] = updates[key]
      }
    }
  }

  const booking = await prisma.booking.update({
    where: { id },
    data,
  })

  return NextResponse.json(booking)
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Booking ID required" }, { status: 400 })

  const existing = await prisma.booking.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

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
      cancelledBy: "admin",
    })
  } catch (err) {
    console.error("Failed to send cancellation email:", err)
  }

  return NextResponse.json({ success: true })
}
