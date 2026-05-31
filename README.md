# CryptoTax Simple

Browser-based crypto tax calculator. No account needed. Upload CSV, get IRS Form 8949 PDF.

**Live:** https://cryptotax-three.vercel.app  
**GitHub:** https://github.com/LabibTanous/cryptotax-simple  
**Vercel:** https://vercel.com/labibtanous-projects/cryptotax

## What It Does

- Upload CSV exports from Coinbase, Kraken, or Binance (or all three combined)
- Runs FIFO tax calculations 100% in-browser — no data ever leaves your device
- Outputs IRS Form 8949 PDF ready to file
- One-time payment ($29 / $49 / $99) — no subscription

## Stack

- **Framework:** Next.js + React 19 + TypeScript
- **Styling:** Tailwind CSS v4
- **PDF:** jsPDF (dynamic import, SSR-safe)
- **CSV parsing:** PapaParse
- **Payments:** Stripe Checkout (test mode — switch to live keys when ready)
- **Deploy:** Vercel

## Architecture

100% client-side. No database. No backend except `/api/checkout` (Stripe session).  
Data flows via `sessionStorage` between pages.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — pricing tiers |
| `/upload` | CSV upload (multi-exchange) |
| `/results` | Tax dashboard + Stripe paywall |
| `/privacy` | Privacy Policy |
| `/terms` | Terms of Service |
| `/api/checkout` | Stripe Checkout session |

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/calculator/fifo.ts` | FIFO engine — buys/sells/income/transfers |
| `src/lib/parsers/` | CSV parsers for Coinbase, Kraken, Binance |
| `src/lib/report/form8949.ts` | PDF generator (landscape A4, jsPDF) |

## Local Dev

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # verify prod build
npm run lint
```

## Deploy

```bash
git add . && git commit -m "feat: ..."
git push origin main
vercel deploy --prod --scope labibtanous-projects --yes
```

## Stripe

Test keys active. Switch env vars on Vercel dashboard when ready for real payments:
- `STRIPE_SECRET_KEY` → `sk_live_...`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_...`

## Roadmap

- [ ] Email capture before results (build list)
- [ ] Analytics
- [ ] Live Stripe keys
