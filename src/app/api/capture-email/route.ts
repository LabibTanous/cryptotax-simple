import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  let email: string, totalGains: number, shortTermGains: number, longTermGains: number, taxableEvents: number
  try {
    const body = await req.json() as {
      email: string
      totalGains: number
      shortTermGains: number
      longTermGains: number
      taxableEvents: number
    }
    email = body.email
    totalGains = body.totalGains
    shortTermGains = body.shortTermGains
    longTermGains = body.longTermGains
    taxableEvents = body.taxableEvents
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const resendKey = process.env.RESEND_API_KEY

  // If no Resend key, still succeed silently (don't block user)
  if (!resendKey) {
    return NextResponse.json({ ok: true })
  }

  const notifyEmail = process.env.NOTIFY_EMAIL
  if (!notifyEmail) {
    return NextResponse.json({ ok: true })
  }

  // Sanitize user-supplied data before embedding in HTML
  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CryptoTax Simple <onboarding@resend.dev>',
        to: [notifyEmail],
        subject: `New lead: ${escapeHtml(email)}`,
        html: `
          <h2>New CryptoTax lead</h2>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Total gains/losses:</strong> ${fmt(totalGains)}</p>
          <p><strong>Short-term:</strong> ${fmt(shortTermGains)}</p>
          <p><strong>Long-term:</strong> ${fmt(longTermGains)}</p>
          <p><strong>Taxable events:</strong> ${Number(taxableEvents)}</p>
          <hr/>
          <p style="color:#888;font-size:12px">Sent from cryptotax-three.vercel.app</p>
        `,
      }),
    })
  } catch (err) {
    console.error('Resend error:', err)
    // Don't fail the user if email notification fails
  }

  return NextResponse.json({ ok: true })
}
