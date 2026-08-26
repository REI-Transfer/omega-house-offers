import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName, phone, address, city, state, zip } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: "Valid email required" },
        { status: 400 }
      )
    }

    const webhookUrl = process.env.BOOK_WEBHOOK_URL
    if (!webhookUrl) {
      console.error("BOOK_WEBHOOK_URL not configured")
      return NextResponse.json(
        { success: false, error: "Service unavailable" },
        { status: 503 }
      )
    }

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: (firstName || "").trim(),
        lastName: (lastName || "").trim(),
        email: email.trim().toLowerCase(),
        phone: (phone || "").trim(),
        address: (address || "").trim(),
        city: (city || "").trim(),
        state: (state || "").trim(),
        postalCode: (zip || "").trim(),
        bookRequested: "The Perfect Cash Offer",
        source: "1-800 Buys Houses - Book Request",
        requestedAt: new Date().toISOString(),
      }),
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
