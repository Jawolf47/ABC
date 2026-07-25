import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const events = await prisma.event.findMany({
    include: { registrations: true },
    orderBy: { date: "asc" },
  })
  return NextResponse.json(events)
}

const BUSINESS_EMAIL = "alphabearc@gmail.com"

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    const { name, email, phone, eventType, preferredDate, preferredTime, estimatedGuests, message } = data

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (apiKey) {
      const inquiryHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, sans-serif; background: #f5f5f5; padding: 40px 20px;">
          <table style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
            <tr><td style="padding: 32px 32px 0;">
              <h1 style="font-size: 24px; margin: 0; color: #1a1a1a;">New Event Inquiry</h1>
            </td></tr>
            <tr><td style="padding: 24px 32px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; font-size: 14px;">Name</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; font-weight: 600; color: #1a1a1a;">${name}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; font-size: 14px;">Email</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; font-weight: 600; color: #1a1a1a;">${email}</td></tr>
                ${phone ? `<tr><td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; font-size: 14px;">Phone</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; font-weight: 600; color: #1a1a1a;">${phone}</td></tr>` : ""}
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; font-size: 14px;">Event Type</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; text-transform: capitalize; font-weight: 600; color: #1a1a1a;">${eventType}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; font-size: 14px;">Preferred Date</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; font-weight: 600; color: #1a1a1a;">${preferredDate || "Not specified"}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; font-size: 14px;">Preferred Time</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; font-weight: 600; color: #1a1a1a;">${preferredTime || "Not specified"}</td></tr>
                <tr><td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; font-size: 14px;">Estimated Guests</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; font-weight: 600; color: #1a1a1a;">${estimatedGuests}</td></tr>
                ${message ? `<tr><td style="padding: 12px 0; color: #666; font-size: 14px;">Message</td>
                    <td style="padding: 12px 0; text-align: right; font-size: 14px; color: #1a1a1a;">${message}</td></tr>` : ""}
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Alpha Bear Club <bookings@alphabearclub.com>",
          to: [BUSINESS_EMAIL],
          subject: `New Event Inquiry from ${name}`,
          html: inquiryHtml,
        }),
      })
    }

    return NextResponse.json({
      success: true,
      message: "Event inquiry received. We will contact you within 24 hours.",
    })
  } catch (e) {
    console.error("Event inquiry error:", e)
    return NextResponse.json({ error: "Failed to submit inquiry" }, { status: 500 })
  }
}
