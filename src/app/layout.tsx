import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'CryptoTax Simple — Crypto taxes done in 3 minutes',
  description:
    'Upload your Coinbase, Kraken, or Binance CSV. Get IRS-ready Form 8949 instantly. No accountant needed.',
  keywords: 'crypto tax software, crypto taxes, form 8949, coinbase tax, bitcoin tax calculator',
  openGraph: {
    title: 'CryptoTax Simple — Crypto taxes done in 3 minutes',
    description: 'Upload your exchange CSV. Calculate every gain & loss. Download IRS Form 8949 PDF instantly. No accountant needed.',
    url: 'https://cryptotax-three.vercel.app',
    siteName: 'CryptoTax Simple',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CryptoTax Simple — Crypto taxes done in 3 minutes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoTax Simple — Crypto taxes done in 3 minutes',
    description: 'Upload your exchange CSV. Download IRS Form 8949 PDF. No accountant needed.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-screen bg-white antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
