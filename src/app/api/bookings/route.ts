import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(bookings)
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const booking = await prisma.booking.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        date: new Date(data.date),
        timeSlot: data.timeSlot,
        duration: data.duration || 60,
        guests: data.guests || 1,
        type: data.type || "individual",
        notes: data.notes || null,
      },
    })
    return NextResponse.json(booking)
  } catch {
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
