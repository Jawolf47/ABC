import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST() {
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE ShootingProgress ADD COLUMN endsData TEXT`
    )
    await prisma.$executeRawUnsafe(
      `ALTER TABLE ShootingProgress ADD COLUMN bowType TEXT`
    )
    return NextResponse.json({ ok: true, message: "Columns added" })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
