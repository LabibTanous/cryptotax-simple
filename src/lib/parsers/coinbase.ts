import Papa from 'papaparse'
import type { RawTransaction } from '../types'

interface CoinbaseRow {
  Timestamp: string
  'Transaction Type': string
  Asset: string
  'Quantity Transacted': string
  'Spot Price Currency': string
  'Spot Price at Transaction': string
  Subtotal: string
  'Total (inclusive of fees and/or spread)': string
  'Fees and/or Spread': string
  Notes: string
}

function usd(val: string | undefined): number {
  if (!val) return 0
  return parseFloat(val.replace(/[$,]/g, '')) || 0
}

export function parseCoinbaseCSV(csvText: string): RawTransaction[] {
  // Skip the first few disclaimer lines Coinbase adds before the header
  const lines = csvText.split('\n')
  const headerIdx = lines.findIndex((l) => l.includes('Timestamp') && l.includes('Transaction Type'))
  const cleanCsv = headerIdx > 0 ? lines.slice(headerIdx).join('\n') : csvText

  const result = Papa.parse<CoinbaseRow>(cleanCsv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })

  const transactions: RawTransaction[] = []

  for (const row of result.data) {
    const rawType = (row['Transaction Type'] || '').toLowerCase().trim()
    const asset = (row['Asset'] || '').trim().toUpperCase()
    const amount = Math.abs(parseFloat(row['Quantity Transacted'] || '0'))
    const spotPrice = usd(row['Spot Price at Transaction'])
    const subtotal = usd(row['Subtotal'])
    const total = usd(row['Total (inclusive of fees and/or spread)'])
    const fees = usd(row['Fees and/or Spread'])
    const date = new Date(row['Timestamp'] || '')

    if (!asset || !amount || isNaN(date.getTime())) continue

    let type: RawTransaction['type']

    if (rawType === 'buy' || rawType === 'advanced trade buy') type = 'buy'
    else if (rawType === 'sell' || rawType === 'advanced trade sell') type = 'sell'
    else if (rawType === 'send') type = 'transfer_out'
    else if (rawType === 'receive') type = 'transfer_in'
    else if (
      ['rewards income', 'coinbase earn', 'learning reward', 'staking income',
       'interest income', 'inflation reward', 'promocodebonus'].includes(rawType)
    ) type = 'income'
    else if (rawType === 'convert') {
      // Convert: treat as sell (user swapped one crypto for another)
      type = 'sell'
    }
    else continue

    const totalUsd = total || subtotal || amount * spotPrice

    transactions.push({
      date,
      type,
      asset,
      amount,
      priceUsd: spotPrice,
      feeUsd: fees,
      totalUsd: Math.abs(totalUsd),
      notes: row['Notes'],
    })
  }

  return transactions
}
