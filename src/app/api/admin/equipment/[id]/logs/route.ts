import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const logs = await prisma.equipmentLog.findMany({
    where: { equipmentId: id },
    orderBy: { date: "desc" },
  })
  return NextResponse.json({ logs })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { date, type, description, quantity, notes } = body

  if (!date || !type || !description) {
    return NextResponse.json({ error: "Date, type, and description are required" }, { status: 400 })
  }

  const log = await prisma.equipmentLog.create({
    data: {
      equipmentId: id,
      date,
      type,
      description,
      quantity: quantity || 0,
      notes: notes || null,
    },
  })

  if (type === "added" || type === "returned") {
    await prisma.equipment.update({
      where: { id },
      data: { quantity: { increment: quantity || 1 } },
    })
  } else if (type === "removed" || type === "lost" || type === "damaged") {
    await prisma.equipment.update({
      where: { id },
      data: { quantity: { decrement: quantity || 1 } },
    })
  }

  return NextResponse.json({ log })
}
