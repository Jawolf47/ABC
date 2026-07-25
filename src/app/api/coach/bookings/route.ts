import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id || (session.user.role !== "coach" && session.user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const date = searchParams.get("date")

  const where: Record<string, unknown> = {}
  if (status) where.status = status
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
