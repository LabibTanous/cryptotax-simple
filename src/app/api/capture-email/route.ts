import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email, totalGains, shortTermGains, longTermGains, taxableEvents } =
    await req.json() as {
      email: string
      totalGains: number
      shortTermGains: number
      longTermGains: number
      taxableEvents: number
    }

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const resendKey = process.env.RESEND_API_KEY

  // If no Resend key, still succeed silently (don't block user)
  if (!resendKey) {
    return NextResponse.json({ ok: true })
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
        to: ['labibtanous@gmail.com'],
        subject: `New lead: ${email}`,
        html: `
          <h2>New CryptoTax lead</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Total gains/losses:</strong> ${fmt(totalGains)}</p>
          <p><strong>Short-term:</strong> ${fmt(shortTermGains)}</p>
          <p><strong>Long-term:</strong> ${fmt(longTermGains)}</p>
          <p><strong>Taxable events:</strong> ${taxableEvents}</p>
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
