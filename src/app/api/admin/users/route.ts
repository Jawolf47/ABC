import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "admin") {
    return null
  }
  return session
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("id")

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        role: true,
        createdAt: true,
      },
    })
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { userId },
          { email: user.email || "" },
        ],
      },
      orderBy: { date: "desc" },
    })

    return NextResponse.json({ user, bookings })
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ users })
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const body = await req.json()
  const { id, role } = body

  if (!id || !role) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  if (!["admin", "customer", "coach"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  const PROTECTED_ADMINS = ["cmrmq0ksp000004l21bqbwxk2", "cmrwty8pf000004ktiqdwns9u"]
  if (role === "customer" && PROTECTED_ADMINS.includes(id)) {
    return NextResponse.json({ error: "This admin cannot be removed." }, { status: 403 })
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  })

  return NextResponse.json(user)
}
