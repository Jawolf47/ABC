import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const where: Record<string, unknown> = { adminId: session.user.id }

  const category = searchParams.get("category")
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  if (category) where.category = category
  if (from || to) {
    where.date = {}
    if (from) (where.date as Record<string, Date>).gte = new Date(from)
    if (to) (where.date as Record<string, Date>).lte = new Date(to + "T23:59:59")
  }

  const expenses = await prisma.expense.findMany({ where, orderBy: { date: "desc" } })
  return NextResponse.json({ expenses })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { date, category, description, amount, miles, notes } = body
  if (!description) return NextResponse.json({ error: "Description is required" }, { status: 400 })

  const parsedAmount = category === "Transportation" && miles ? parseFloat(miles) * 0.76 : parseFloat(amount)
  if (!parsedAmount || isNaN(parsedAmount)) return NextResponse.json({ error: "Amount is required" }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true } })

  const expense = await prisma.expense.create({
    data: {
      date: date ? new Date(date + "T12:00:00") : new Date(),
      category,
      description,
      amount: parsedAmount,
      miles: category === "Transportation" && miles ? parseFloat(miles) : null,
      notes: notes || null,
      adminId: session.user.id,
      adminName: user?.name || user?.email || "Coach",
    },
  })

  return NextResponse.json({ expense })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

  const expense = await prisma.expense.findUnique({ where: { id } })
  if (!expense || expense.adminId !== session.user.id) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 })
  }

  await prisma.expense.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
