import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const progress = await prisma.shootingProgress.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  })
  return NextResponse.json({ progress })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { distance, notes, bookingId, endsData, bowType } = body

  if (!bookingId) {
    return NextResponse.json({ error: "Booking is required" }, { status: 400 })
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }
  if (booking.userId !== session.user.id) {
    return NextResponse.json({ error: "Not your booking" }, { status: 403 })
  }

  const entryDate = booking.date

  let finalScore: number | null = null
  let finalMaxScore: number | null = null
  let finalArrowsShot = 0

  if (endsData && Array.isArray(endsData) && endsData.length > 0) {
    const allArrows = endsData.flat()
    finalArrowsShot = allArrows.length
    finalScore = allArrows.reduce((a: number, b: number) => a + b, 0)
    finalMaxScore = allArrows.length * 10
  }

  const accuracy = finalScore && finalMaxScore ? (finalScore / finalMaxScore) * 100 : null

  const entry = await prisma.shootingProgress.create({
    data: {
      userId: session.user.id,
      bookingId,
      date: entryDate,
      distance: distance ? Number(distance) : null,
      arrowsShot: finalArrowsShot,
      score: finalScore,
      maxScore: finalMaxScore,
      accuracy,
      endsData: endsData ? JSON.stringify(endsData) : null,
      bowType: bowType || null,
      notes: notes || null,
    },
  })

  return NextResponse.json(entry)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Only admins can delete progress entries" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 })
  }

  const entry = await prisma.shootingProgress.findUnique({ where: { id } })
  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.shootingProgress.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
