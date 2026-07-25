interface BookingEmailData {
  name: string
  email: string
  date: string
  timeSlot: string
  duration: number
  guests: number
  type: string
  notes?: string | null
}

export async function sendBookingConfirmation(data: BookingEmailData) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log("[email] No RESEND_API_KEY set. Would have sent booking confirmation to", data.email)
    return
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, sans-serif; background: #f5f5f5; padding: 40px 20px;">
      <table style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
        <tr>
          <td style="padding: 32px 32px 0;">
            <h1 style="font-size: 24px; margin: 0; color: #1a1a1a;">Booking Confirmed</h1>
            <p style="color: #666; margin-top: 8px;">Thanks, ${data.name}! Your session is booked.</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 24px 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; font-size: 14px;">Type</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; font-weight: 600; color: #1a1a1a; text-transform: capitalize;">${data.type} Session</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; font-size: 14px;">Date</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; font-weight: 600; color: #1a1a1a;">${data.date}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; font-size: 14px;">Time</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; font-weight: 600; color: #1a1a1a;">${data.timeSlot} (${data.duration} min)</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; font-size: 14px;">Guests</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; font-weight: 600; color: #1a1a1a;">${data.guests}</td>
              </tr>
              ${data.notes ? `
              <tr>
                <td style="padding: 12px 0; color: #666; font-size: 14px;">Notes</td>
                <td style="padding: 12px 0; text-align: right; font-size: 14px; color: #1a1a1a;">${data.notes}</td>
              </tr>` : ""}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 32px 32px;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              See you at the range! Need to reschedule? Contact us at
              <a href="mailto:hello@alphabearclub.com" style="color: #d97706;">hello@alphabearclub.com</a>.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background: #fafafa; padding: 16px 32px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #999;">Alpha Bear Club</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Alpha Bear Club <bookings@alphabearclub.com>",
        to: [data.email],
        subject: "Booking Confirmed - Alpha Bear Club",
        html,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error("[email] Resend API error:", res.status, body)
    } else {
      console.log("[email] Confirmation sent to", data.email)
    }
  } catch (err) {
    console.error("[email] Failed to send booking confirmation:", err)
  }
}

interface CancellationEmailData {
  name: string
  email: string
  date: string
  timeSlot: string
  duration: number
  guests: number
  type: string
  cancelledBy: string
}

export async function sendCancellationEmail(data: CancellationEmailData) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log("[email] No RESEND_API_KEY set. Would have sent cancellation to", data.email)
    return
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, sans-serif; background: #f5f5f5; padding: 40px 20px;">
      <table style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
        <tr>
          <td style="padding: 32px 32px 0;">
            <h1 style="font-size: 24px; margin: 0; color: #dc2626;">Booking Cancelled</h1>
            <p style="color: #666; margin-top: 8px;">Hi ${data.name}, your session has been cancelled${data.cancelledBy === "admin" ? " by our team" : ""}.</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 24px 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; font-size: 14px;">Type</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; font-weight: 600; color: #1a1a1a; text-transform: capitalize;">${data.type} Session</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; font-size: 14px;">Date</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; font-weight: 600; color: #1a1a1a;">${data.date}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; font-size: 14px;">Time</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; font-weight: 600; color: #1a1a1a;">${data.timeSlot} (${data.duration} min)</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #666; font-size: 14px;">Shooters</td>
                <td style="padding: 12px 0; text-align: right; font-size: 14px; font-weight: 600; color: #1a1a1a;">${data.guests}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 32px 32px;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              Want to rebook? Visit <a href="https://alpha-bear-club.vercel.app/booking" style="color: #d97706;">our booking page</a> or contact us at
              <a href="mailto:alphabearc@gmail.com" style="color: #d97706;">alphabearc@gmail.com</a>.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background: #fafafa; padding: 16px 32px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #999;">Alpha Bear Club</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Alpha Bear Club <bookings@alphabearclub.com>",
        to: [data.email, "alphabearc@gmail.com"],
        subject: "Booking Cancelled - Alpha Bear Club",
        html,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error("[email] Resend API error:", res.status, body)
    } else {
      console.log("[email] Cancellation sent to", data.email, "and alphabearc@gmail.com")
    }
  } catch (err) {
    console.error("[email] Failed to send cancellation email:", err)
  }
}
