import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      street: true,
      city: true,
      state: true,
      zip: true,
      guestsTypical: true,
      birthDate: true,
    },
  })

  return NextResponse.json(user)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { name, email, phone, street, city, state, zip, guestsTypical, birthDate } = body

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: name || undefined,
      email: email || undefined,
      phone: phone || null,
      street: street || null,
      city: city || null,
      state: state || null,
      zip: zip || null,
      guestsTypical: guestsTypical ? parseInt(guestsTypical) : null,
      birthDate: birthDate || null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      street: true,
      city: true,
      state: true,
      zip: true,
      guestsTypical: true,
      birthDate: true,
    },
  })

  return NextResponse.json(user)
}
