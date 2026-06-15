import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Message received. We will get back to you soon." })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
