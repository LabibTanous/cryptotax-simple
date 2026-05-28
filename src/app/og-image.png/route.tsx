import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'CryptoTax Simple'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f172a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Grid overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{
            width: 48, height: 48,
            background: '#4f46e5',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 20, fontWeight: 700,
          }}>₿</div>
          <span style={{ color: '#e2e8f0', fontSize: 24, fontWeight: 600 }}>CryptoTax Simple</span>
        </div>

        {/* Headline */}
        <div style={{
          color: 'white',
          fontSize: 72,
          fontWeight: 800,
          lineHeight: 1.0,
          letterSpacing: '-0.03em',
          marginBottom: '24px',
          maxWidth: 800,
        }}>
          Your crypto taxes,{'\n'}done in 3 minutes.
        </div>

        {/* Sub */}
        <div style={{ color: '#94a3b8', fontSize: 28, marginBottom: '48px', maxWidth: 700 }}>
          Upload your Coinbase, Kraken, or Binance CSV.{'\n'}Get IRS Form 8949 PDF instantly.
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {['IRS Compliant', '100% Private', 'Instant PDF', 'No Account Needed'].map((badge) => (
            <div key={badge} style={{
              background: 'rgba(79,70,229,0.2)',
              border: '1px solid rgba(79,70,229,0.4)',
              color: '#a5b4fc',
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 500,
            }}>{badge}</div>
          ))}
        </div>

        {/* Price tag */}
        <div style={{
          position: 'absolute',
          bottom: 80,
          right: 80,
          color: '#64748b',
          fontSize: 20,
        }}>
          From $29 · preview free
        </div>
      </div>
    ),
    { ...size }
  )
}
