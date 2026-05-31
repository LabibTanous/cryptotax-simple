# CryptoTax Simple — Agent Rules

## Project Context

100% client-side Next.js crypto tax calculator. No database. No auth. No backend except Stripe API route.  
Live: https://cryptotax-three.vercel.app

## Critical Rules

- NEVER send user CSV data or transactions to any server — all computation stays in-browser
- NEVER add server components that process financial data
- NEVER commit `.env.local` or any file with Stripe keys
- ALWAYS use dynamic imports for jsPDF (SSR breaks otherwise)
- ALWAYS run `npm run build` after changes to verify no SSR errors

## Architecture

- Data flows via `sessionStorage` — upload page writes, results page reads
- Paywall: `isPaid` state + `?paid=true` URL param after Stripe redirect
- FIFO engine in `src/lib/calculator/fifo.ts` — do not change tax logic without verifying against IRS Form 8949 rules

## Deploy Workflow

```bash
git add <files>
git commit -m "type: description"
git push origin main
vercel deploy --prod --scope labibtanous-projects --yes
```

## Next.js Version Note

This version may have breaking changes from training data. Check `node_modules/next/dist/docs/` before writing code.
