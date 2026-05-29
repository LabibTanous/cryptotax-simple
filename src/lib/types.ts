export type ExchangeType = 'coinbase' | 'kraken' | 'binance' | 'wallet_eth' | 'wallet_btc'

export interface RawTransaction {
  date: Date
  type: 'buy' | 'sell' | 'transfer_in' | 'transfer_out' | 'income'
  asset: string
  amount: number
  priceUsd: number
  feeUsd: number
  totalUsd: number
  notes?: string
}

export interface TaxLot {
  date: Date
  amount: number
  costBasisPerUnit: number
  remainingAmount: number
}

export interface TaxableEvent {
  asset: string
  dateAcquired: string
  dateSold: string
  proceeds: number
  costBasis: number
  gain: number
  isLongTerm: boolean
  description: string
}

export interface AssetSummary {
  totalBought: number
  totalSold: number
  currentHoldings: number
  realizedGain: number
}

export interface TaxSummary {
  shortTermGains: number
  longTermGains: number
  totalGains: number
  totalTransactions: number
  taxableEvents: TaxableEvent[]
  assets: Record<string, AssetSummary>
}
