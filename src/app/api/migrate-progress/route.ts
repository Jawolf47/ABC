import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ShootingProgress" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "bookingId" TEXT,
        "date" TIMESTAMP(3) NOT NULL,
        "distance" INTEGER,
        "arrowsShot" INTEGER NOT NULL DEFAULT 0,
        "score" INTEGER,
        "maxScore" INTEGER,
        "accuracy" DOUBLE PRECISION,
        "notes" TEXT,
        "imageUrl" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ShootingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `)
    return NextResponse.json({ ok: true, message: "ShootingProgress table created" })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
