import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const PLANS = {
  simple:   { price: 2900, label: 'CryptoTax Simple — Up to 100 transactions' },
  standard: { price: 4900, label: 'CryptoTax Standard — Up to 500 transactions' },
  pro:      { price: 9900, label: 'CryptoTax Pro — Unlimited transactions' },
}

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const stripe = new Stripe(stripeKey)

  let plan: string
  let transactionCount: number
  try {
    const body = await req.json() as { plan: string; transactionCount: number }
    plan = body.plan
    transactionCount = body.transactionCount
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const planKey = (plan as keyof typeof PLANS) in PLANS ? (plan as keyof typeof PLANS) : 'simple'
  const selected = PLANS[planKey]

  const origin = req.headers.get('origin') || 'https://cryptotax-three.vercel.app'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: selected.price,
            product_data: {
              name: selected.label,
              description: `${transactionCount} transactions · FIFO method · Form 8949 PDF`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/results?paid=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/results`,
      metadata: { plan: planKey, transactionCount: String(transactionCount) },
    })
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
