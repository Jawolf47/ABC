import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const events = await prisma.event.findMany({
    include: { registrations: true },
    orderBy: { date: "asc" },
  })
  return NextResponse.json(events)
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    if (data.type === "inquiry") {
      return NextResponse.json({
        success: true,
        message: "Event inquiry received. We will contact you within 24 hours.",
      })
    }

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        endDate: data.endDate ? new Date(data.endDate) : null,
        maxGuests: parseInt(data.maxGuests),
        price: parseFloat(data.price) || 0,
        type: data.type || "group",
      },
    })
    return NextResponse.json(event)
  } catch {
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
