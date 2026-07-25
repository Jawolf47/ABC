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
  const { date, distance, arrowsShot, score, maxScore, notes, imageUrl, bookingId, endsData, bowType } = body

  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 })
  }

  const [y, m, d] = date.split("-").map(Number)
  const entryDate = new Date(y, m - 1, d)

  let finalScore = score ? Number(score) : null
  let finalMaxScore = maxScore ? Number(maxScore) : null
  let finalArrowsShot = arrowsShot ? Number(arrowsShot) : 0

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
      bookingId: bookingId || null,
      date: entryDate,
      distance: distance ? Number(distance) : null,
      arrowsShot: finalArrowsShot,
      score: finalScore,
      maxScore: finalMaxScore,
      accuracy,
      endsData: endsData ? JSON.stringify(endsData) : null,
      bowType: bowType || null,
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
