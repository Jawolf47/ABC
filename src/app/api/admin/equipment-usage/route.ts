import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get("date")
  const status = searchParams.get("status") // "out" or "returned"

  const where: Record<string, unknown> = {}
  if (date) {
    const [y, m, d] = date.split("-").map(Number)
    const dayStart = new Date(y, m - 1, d)
    const dayEnd = new Date(y, m - 1, d, 23, 59, 59, 999)
    where.OR = [
      { date: { gte: dayStart, lte: dayEnd } },
      { returnedAt: null },
    ]
  }
  if (status === "out") {
    where.returnedAt = null
    delete where.OR
  } else if (status === "returned") {
    where.returnedAt = { not: null }
    delete where.OR
  }

  const usages = await prisma.equipmentUsage.findMany({
    where,
    orderBy: { checkedOutAt: "desc" },
    include: { equipment: { select: { name: true, category: true } } },
  })
  return NextResponse.json({ usages })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { equipmentId, bookingId, eventName, date, checkedOutBy, quantityOut, conditionOut, notes } = body

  if (!equipmentId || !date || !checkedOutBy) {
    return NextResponse.json({ error: "Equipment, date, and checked out by are required" }, { status: 400 })
  }

  const qty = quantityOut || 1

  const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } })
  if (!equipment) {
    return NextResponse.json({ error: "Equipment not found" }, { status: 404 })
  }

  const checkedOutCount = await prisma.equipmentUsage.aggregate({
    where: { equipmentId, returnedAt: null },
    _sum: { quantityOut: true },
  })
  const currentlyOut = checkedOutCount._sum.quantityOut || 0
  const available = equipment.quantity - currentlyOut

  if (qty > available) {
    return NextResponse.json({ error: `Only ${available} available (${equipment.quantity} total, ${currentlyOut} checked out)` }, { status: 400 })
  }

  const [y, m, d] = date.split("-").map(Number)
  const usageDate = new Date(y, m - 1, d)

  const usage = await prisma.equipmentUsage.create({
    data: {
      equipmentId,
      bookingId: bookingId || null,
      eventName: eventName || null,
      date: usageDate,
      checkedOutBy,
      quantityOut: qty,
      conditionOut: conditionOut || "good",
      notes: notes || null,
    },
    include: { equipment: { select: { name: true, category: true } } },
  })

  return NextResponse.json(usage)
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, returnedAt, conditionIn, returnedBy, notes } = body

  if (!id) {
    return NextResponse.json({ error: "Usage ID required" }, { status: 400 })
  }

  const usage = await prisma.equipmentUsage.update({
    where: { id },
    data: {
      returnedAt: returnedAt ? new Date(returnedAt) : new Date(),
      conditionIn: conditionIn || null,
      returnedBy: returnedBy || null,
      notes: notes || undefined,
    },
    include: { equipment: { select: { name: true, category: true } } },
  })

  return NextResponse.json(usage)
}
