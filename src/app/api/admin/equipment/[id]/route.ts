import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { name, category, quantity, condition, purchaseDate, purchaseCost, currentValue, serialNumber, notes, active } = body

  const equipment = await prisma.equipment.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(category !== undefined && { category }),
      ...(quantity !== undefined && { quantity }),
      ...(condition !== undefined && { condition }),
      ...(purchaseDate !== undefined && { purchaseDate }),
      ...(purchaseCost !== undefined && { purchaseCost }),
      ...(currentValue !== undefined && { currentValue }),
      ...(serialNumber !== undefined && { serialNumber }),
      ...(notes !== undefined && { notes }),
      ...(active !== undefined && { active }),
    },
  })

  return NextResponse.json({ equipment })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.equipment.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
