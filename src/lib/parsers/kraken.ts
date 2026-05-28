import Papa from 'papaparse'
import type { RawTransaction } from '../types'

interface KrakenRow {
  txid: string
  refid: string
  time: string
  type: string
  subtype: string
  aclass: string
  asset: string
  amount: string
  fee: string
  balance: string
}

const KRAKEN_FIAT = new Set(['ZUSD', 'ZEUR', 'ZGBP', 'ZCAD', 'USD', 'EUR', 'GBP', 'CAD'])

function normalizeKrakenAsset(asset: string): string {
  // Kraken prefixes assets with X or Z
  return asset.replace(/^X/, '').replace(/^Z/, '').toUpperCase()
}

export function parseKrakenCSV(csvText: string): RawTransaction[] {
  const result = Papa.parse<KrakenRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })

  // Kraken ledger has paired entries for trades (debit + credit)
  // Group by refid to match buy/sell pairs
  const byRef: Record<string, KrakenRow[]> = {}
  for (const row of result.data) {
    if (!row.refid) continue
    if (!byRef[row.refid]) byRef[row.refid] = []
    byRef[row.refid].push(row)
  }

  const transactions: RawTransaction[] = []

  for (const rows of Object.values(byRef)) {
    const type = (rows[0]?.type || '').toLowerCase()

    if (type === 'trade') {
      // Two rows: one negative (sold), one positive (bought)
      const credit = rows.find((r) => parseFloat(r.amount) > 0)
      const debit = rows.find((r) => parseFloat(r.amount) < 0)
      if (!credit || !debit) continue

      const creditAsset = normalizeKrakenAsset(credit.asset)
      const debitAsset = normalizeKrakenAsset(debit.asset)

      const creditIsFiat = KRAKEN_FIAT.has(creditAsset)
      const debitIsFiat = KRAKEN_FIAT.has(debitAsset)

      const date = new Date(rows[0].time)
      if (isNaN(date.getTime())) continue

      if (!creditIsFiat && debitIsFiat) {
        // Bought crypto with fiat
        const amount = parseFloat(credit.amount)
        const totalUsd = Math.abs(parseFloat(debit.amount))
        const fee = parseFloat(credit.fee || '0')
        transactions.push({
          date,
          type: 'buy',
          asset: creditAsset,
          amount,
          priceUsd: amount > 0 ? totalUsd / amount : 0,
          feeUsd: fee * (totalUsd / amount || 0),
          totalUsd,
        })
      } else if (creditIsFiat && !debitIsFiat) {
        // Sold crypto for fiat
        const amount = Math.abs(parseFloat(debit.amount))
        const totalUsd = parseFloat(credit.amount)
        const fee = parseFloat(credit.fee || '0')
        transactions.push({
          date,
          type: 'sell',
          asset: debitAsset,
          amount,
          priceUsd: amount > 0 ? totalUsd / amount : 0,
          feeUsd: fee,
          totalUsd: totalUsd - fee,
        })
      } else if (!creditIsFiat && !debitIsFiat) {
        // Crypto-to-crypto swap: record debit as sell, credit as buy
        const sellAmount = Math.abs(parseFloat(debit.amount))
        const buyAmount = parseFloat(credit.amount)
        // We don't know USD value here — record as $0 (will need manual review)
        transactions.push({
          date,
          type: 'sell',
          asset: debitAsset,
          amount: sellAmount,
          priceUsd: 0,
          feeUsd: 0,
          totalUsd: 0,
        })
        transactions.push({
          date,
          type: 'buy',
          asset: creditAsset,
          amount: buyAmount,
          priceUsd: 0,
          feeUsd: 0,
          totalUsd: 0,
        })
      }
    } else if (type === 'deposit' || type === 'receive') {
      for (const row of rows) {
        const asset = normalizeKrakenAsset(row.asset)
        if (KRAKEN_FIAT.has(asset)) continue
        const amount = parseFloat(row.amount)
        if (amount <= 0) continue
        transactions.push({
          date: new Date(row.time),
          type: 'transfer_in',
          asset,
          amount,
          priceUsd: 0,
          feeUsd: parseFloat(row.fee || '0'),
          totalUsd: 0,
        })
      }
    } else if (type === 'withdrawal' || type === 'send') {
      for (const row of rows) {
        const asset = normalizeKrakenAsset(row.asset)
        if (KRAKEN_FIAT.has(asset)) continue
        const amount = Math.abs(parseFloat(row.amount))
        if (amount <= 0) continue
        transactions.push({
          date: new Date(row.time),
          type: 'transfer_out',
          asset,
          amount,
          priceUsd: 0,
          feeUsd: parseFloat(row.fee || '0'),
          totalUsd: 0,
        })
      }
    } else if (['staking', 'reward', 'dividend', 'airdrop'].includes(type)) {
      for (const row of rows) {
        const asset = normalizeKrakenAsset(row.asset)
        if (KRAKEN_FIAT.has(asset)) continue
        const amount = parseFloat(row.amount)
        if (amount <= 0) continue
        transactions.push({
          date: new Date(row.time),
          type: 'income',
          asset,
          amount,
          priceUsd: 0,
          feeUsd: 0,
          totalUsd: 0,
        })
      }
    }
  }

  return transactions
}
