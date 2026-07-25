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
  const { date, distance, arrowsShot, score, maxScore, notes, imageUrl, bookingId } = body

  if (!date || !arrowsShot) {
    return NextResponse.json({ error: "Date and arrows shot are required" }, { status: 400 })
  }

  const [y, m, d] = date.split("-").map(Number)
  const entryDate = new Date(y, m - 1, d)

  const accuracy = score && maxScore ? (score / maxScore) * 100 : null

  const entry = await prisma.shootingProgress.create({
    data: {
      userId: session.user.id,
      bookingId: bookingId || null,
      date: entryDate,
      distance: distance ? Number(distance) : null,
      arrowsShot: Number(arrowsShot),
      score: score ? Number(score) : null,
      maxScore: maxScore ? Number(maxScore) : null,
      accuracy,
      notes: notes || null,
      imageUrl: imageUrl || null,
    },
  })

  return NextResponse.json(entry)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 })
  }

  const entry = await prisma.shootingProgress.findUnique({ where: { id } })
  if (!entry || entry.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.shootingProgress.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
