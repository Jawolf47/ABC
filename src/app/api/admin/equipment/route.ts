import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const equipment = await prisma.equipment.findMany({
    orderBy: { createdAt: "desc" },
    include: { logs: { orderBy: { date: "desc" }, take: 5 } },
  })
  return NextResponse.json({ equipment })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, category, quantity, condition, purchaseDate, purchaseCost, currentValue, serialNumber, notes } = body

  if (!name || !category) {
    return NextResponse.json({ error: "Name and category are required" }, { status: 400 })
  }

  const equipment = await prisma.equipment.create({
    data: {
      name,
      category,
      quantity: quantity || 1,
      condition: condition || "good",
      purchaseDate: purchaseDate || null,
      purchaseCost: purchaseCost || null,
      currentValue: currentValue || null,
      serialNumber: serialNumber || null,
      notes: notes || null,
    },
  })

  return NextResponse.json({ equipment })
}
