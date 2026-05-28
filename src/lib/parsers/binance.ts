import Papa from 'papaparse'
import type { RawTransaction } from '../types'

interface BinanceRow {
  User_ID: string
  UTC_Time: string
  Account: string
  Operation: string
  Coin: string
  Change: string
  Remark: string
}

const STABLECOINS = new Set(['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'USDP', 'FDUSD'])
const FIAT = new Set(['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'BRL', 'NGN'])

function isQuote(coin: string): boolean {
  return STABLECOINS.has(coin) || FIAT.has(coin) || coin.endsWith('_BUSD')
}

const INCOME_OPS = new Set([
  'simple earn flexible interest',
  'simple earn locked rewards',
  'savings interest',
  'pos savings interest',
  'eth 2.0 staking rewards',
  'staking rewards',
  'launchpool airdrop',
  'hodler airdrops distribution',
  'megadrop rewards',
  'distribution',
  'commission rebate',
  'commission history',
  'crypto box',
  'binance card cashback',
  'referral kickback',
  'super bnb mining',
])

export function parseBinanceCSV(csvText: string): RawTransaction[] {
  const result = Papa.parse<BinanceRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })

  // Group rows by timestamp to reconstruct trades
  const byTimestamp: Record<string, BinanceRow[]> = {}
  for (const row of result.data) {
    const key = row.UTC_Time?.trim()
    if (!key) continue
    if (!byTimestamp[key]) byTimestamp[key] = []
    byTimestamp[key].push(row)
  }

  const transactions: RawTransaction[] = []

  for (const rows of Object.values(byTimestamp)) {
    // Sort: positive change first
    const sorted = [...rows].sort((a, b) => parseFloat(b.Change) - parseFloat(a.Change))

    const buyRows = rows.filter((r) => {
      const op = (r.Operation || '').toLowerCase()
      const change = parseFloat(r.Change)
      return (op === 'buy' || op === 'transaction related') && change > 0 && !isQuote(r.Coin)
    })

    const sellRows = rows.filter((r) => {
      const op = (r.Operation || '').toLowerCase()
      const change = parseFloat(r.Change)
      return (op === 'sell' || op === 'transaction related') && change < 0 && !isQuote(r.Coin)
    })

    const quoteSpendRows = rows.filter((r) => {
      const op = (r.Operation || '').toLowerCase()
      const change = parseFloat(r.Change)
      return (op === 'buy' || op === 'transaction related') && change < 0 && isQuote(r.Coin)
    })

    const quoteReceiveRows = rows.filter((r) => {
      const op = (r.Operation || '').toLowerCase()
      const change = parseFloat(r.Change)
      return (op === 'sell' || op === 'transaction related') && change > 0 && isQuote(r.Coin)
    })

    // Process buys
    for (const buyRow of buyRows) {
      const date = new Date(buyRow.UTC_Time + ' UTC')
      if (isNaN(date.getTime())) continue
      const amount = parseFloat(buyRow.Change)
      const quoteSpent = quoteSpendRows.find((r) => r.UTC_Time === buyRow.UTC_Time)
      const totalUsd = quoteSpent ? Math.abs(parseFloat(quoteSpent.Change)) : 0
      transactions.push({
        date,
        type: 'buy',
        asset: buyRow.Coin.toUpperCase(),
        amount,
        priceUsd: amount > 0 && totalUsd > 0 ? totalUsd / amount : 0,
        feeUsd: 0,
        totalUsd,
      })
    }

    // Process sells
    for (const sellRow of sellRows) {
      const date = new Date(sellRow.UTC_Time + ' UTC')
      if (isNaN(date.getTime())) continue
      const amount = Math.abs(parseFloat(sellRow.Change))
      const quoteReceived = quoteReceiveRows.find((r) => r.UTC_Time === sellRow.UTC_Time)
      const totalUsd = quoteReceived ? Math.abs(parseFloat(quoteReceived.Change)) : 0
      transactions.push({
        date,
        type: 'sell',
        asset: sellRow.Coin.toUpperCase(),
        amount,
        priceUsd: amount > 0 && totalUsd > 0 ? totalUsd / amount : 0,
        feeUsd: 0,
        totalUsd,
      })
    }

    // Process income (staking, rewards, etc.)
    for (const row of rows) {
      const op = (row.Operation || '').toLowerCase()
      if (!INCOME_OPS.has(op)) continue
      const date = new Date(row.UTC_Time + ' UTC')
      if (isNaN(date.getTime())) continue
      const amount = parseFloat(row.Change)
      if (amount <= 0) continue
      const coin = row.Coin.toUpperCase()
      if (isQuote(coin)) continue
      transactions.push({
        date,
        type: 'income',
        asset: coin,
        amount,
        priceUsd: 0,
        feeUsd: 0,
        totalUsd: 0,
        notes: row.Operation,
      })
    }

    // Process deposits / withdrawals
    for (const row of rows) {
      const op = (row.Operation || '').toLowerCase()
      const date = new Date(row.UTC_Time + ' UTC')
      if (isNaN(date.getTime())) continue
      const coin = row.Coin.toUpperCase()
      if (isQuote(coin)) continue
      const amount = parseFloat(row.Change)

      if (op === 'deposit' || op === 'transfer_in') {
        if (amount > 0) {
          transactions.push({
            date,
            type: 'transfer_in',
            asset: coin,
            amount,
            priceUsd: 0,
            feeUsd: 0,
            totalUsd: 0,
          })
        }
      } else if (op === 'withdraw' || op === 'withdrawal' || op === 'transfer_out') {
        if (amount < 0) {
          transactions.push({
            date,
            type: 'transfer_out',
            asset: coin,
            amount: Math.abs(amount),
            priceUsd: 0,
            feeUsd: 0,
            totalUsd: 0,
          })
        }
      }
    }
  }

  return transactions
}
