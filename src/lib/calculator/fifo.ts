import type { RawTransaction, TaxLot, TaxableEvent, TaxSummary, AssetSummary } from '../types'

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function calculateFIFO(transactions: RawTransaction[]): TaxSummary {
  const sorted = [...transactions].sort((a, b) => a.date.getTime() - b.date.getTime())

  const lots: Record<string, TaxLot[]> = {}
  const taxableEvents: TaxableEvent[] = []
  const assets: Record<string, AssetSummary> = {}

  function ensureAsset(symbol: string) {
    if (!assets[symbol]) {
      assets[symbol] = { totalBought: 0, totalSold: 0, currentHoldings: 0, realizedGain: 0 }
    }
    if (!lots[symbol]) lots[symbol] = []
  }

  for (const tx of sorted) {
    const asset = tx.asset.toUpperCase()
    ensureAsset(asset)

    switch (tx.type) {
      case 'buy':
      case 'income': {
        const costBasisPerUnit =
          tx.amount > 0 ? round2((tx.totalUsd + tx.feeUsd) / tx.amount) : tx.priceUsd

        lots[asset].push({
          date: tx.date,
          amount: tx.amount,
          costBasisPerUnit,
          remainingAmount: tx.amount,
        })
        assets[asset].totalBought += tx.amount
        assets[asset].currentHoldings += tx.amount
        break
      }

      case 'transfer_in': {
        lots[asset].push({
          date: tx.date,
          amount: tx.amount,
          costBasisPerUnit: tx.priceUsd || 0,
          remainingAmount: tx.amount,
        })
        assets[asset].currentHoldings += tx.amount
        break
      }

      case 'transfer_out': {
        assets[asset].currentHoldings = Math.max(0, assets[asset].currentHoldings - tx.amount)
        break
      }

      case 'sell': {
        if (tx.amount <= 0) break
        let remainingToSell = tx.amount
        const proceedsPerUnit = tx.amount > 0 ? tx.totalUsd / tx.amount : tx.priceUsd

        assets[asset].totalSold += tx.amount
        assets[asset].currentHoldings = Math.max(0, assets[asset].currentHoldings - tx.amount)

        while (remainingToSell > 0.000000001) {
          if (lots[asset].length === 0) {
            // Missing cost basis — record as $0 basis
            const proceeds = round2(remainingToSell * proceedsPerUnit)
            taxableEvents.push({
              asset,
              dateAcquired: '2009-01-03',
              dateSold: formatDate(tx.date),
              proceeds,
              costBasis: 0,
              gain: proceeds,
              isLongTerm: true,
              description: `${remainingToSell.toFixed(6)} ${asset} (no cost basis found)`,
            })
            assets[asset].realizedGain += proceeds
            break
          }

          const lot = lots[asset][0]
          const soldFromLot = Math.min(remainingToSell, lot.remainingAmount)
          const proceeds = round2(soldFromLot * proceedsPerUnit)
          const costBasis = round2(soldFromLot * lot.costBasisPerUnit)
          const gain = round2(proceeds - costBasis)

          const holdDays =
            (tx.date.getTime() - lot.date.getTime()) / (1000 * 60 * 60 * 24)
          const isLongTerm = holdDays > 365

          taxableEvents.push({
            asset,
            dateAcquired: formatDate(lot.date),
            dateSold: formatDate(tx.date),
            proceeds,
            costBasis,
            gain,
            isLongTerm,
            description: `${soldFromLot.toFixed(6)} ${asset}`,
          })

          assets[asset].realizedGain += gain
          lot.remainingAmount -= soldFromLot
          remainingToSell -= soldFromLot

          if (lot.remainingAmount < 0.000000001) {
            lots[asset].shift()
          }
        }
        break
      }
    }
  }

  const shortTermGains = round2(
    taxableEvents.filter((e) => !e.isLongTerm).reduce((s, e) => s + e.gain, 0)
  )
  const longTermGains = round2(
    taxableEvents.filter((e) => e.isLongTerm).reduce((s, e) => s + e.gain, 0)
  )

  return {
    shortTermGains,
    longTermGains,
    totalGains: round2(shortTermGains + longTermGains),
    totalTransactions: transactions.length,
    taxableEvents,
    assets,
  }
}
