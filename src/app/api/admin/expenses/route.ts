import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "admin") return null
  return session
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const category = searchParams.get("category")

  const where: Record<string, unknown> = {}
  if (from || to) {
    const dateFilter: Record<string, Date> = {}
    if (from) dateFilter.gte = new Date(from)
    if (to) {
      const [y, m, d] = to.split("-").map(Number)
      dateFilter.lte = new Date(y, m - 1, d, 23, 59, 59, 999)
    }
    where.date = dateFilter
  }
  if (category) where.category = category

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { date: "desc" },
  })

  return NextResponse.json({ expenses })
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const body = await req.json()
  const { date, category, description, amount, miles, notes } = body

  if (!date || !category || !description || amount === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const adminUser = await prisma.user.findUnique({
    where: { id: admin.user.id },
    select: { name: true, email: true },
  })
  const adminDisplayName = adminUser?.name || adminUser?.email || "Admin"

  const [y, m, d] = date.split("-").map(Number)
  const expenseDate = new Date(y, m - 1, d)

  const expense = await prisma.expense.create({
    data: {
      date: expenseDate,
      category,
      description,
      amount: parseFloat(amount),
      miles: miles ? parseFloat(miles) : null,
      notes: notes || null,
      adminId: admin.user.id,
      adminName: adminDisplayName,
    },
  })

  return NextResponse.json(expense)
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

  await prisma.expense.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
