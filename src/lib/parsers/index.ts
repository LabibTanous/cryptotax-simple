import type { ExchangeType, RawTransaction } from '../types'
import { parseCoinbaseCSV } from './coinbase'
import { parseKrakenCSV } from './kraken'
import { parseBinanceCSV } from './binance'

export function parseCSV(csvText: string, exchange: ExchangeType): RawTransaction[] {
  switch (exchange) {
    case 'coinbase':
      return parseCoinbaseCSV(csvText)
    case 'kraken':
      return parseKrakenCSV(csvText)
    case 'binance':
      return parseBinanceCSV(csvText)
  }
}

export function detectExchange(csvText: string): ExchangeType | null {
  const firstLine = csvText.split('\n')[0] || ''
  // Find the header line if there are disclaimer lines above
  const lines = csvText.split('\n')
  const headerLine = lines.find(
    (l) => l.includes('Timestamp') || l.includes('txid') || l.includes('User_ID')
  ) || firstLine

  if (headerLine.includes('Timestamp') && headerLine.includes('Transaction Type')) return 'coinbase'
  if (headerLine.includes('txid') && headerLine.includes('refid')) return 'kraken'
  if (headerLine.includes('User_ID') && headerLine.includes('UTC_Time')) return 'binance'
  return null
}
