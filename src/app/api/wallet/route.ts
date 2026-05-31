import { NextRequest, NextResponse } from 'next/server'
import type { RawTransaction } from '@/lib/types'
import { rateLimit, getIp } from '@/lib/rate-limit'

const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

const ETHERSCAN_KEY = process.env.ETHERSCAN_API_KEY || ''
const ETHERSCAN = 'https://api.etherscan.io/api'
const COINGECKO = 'https://api.coingecko.com/api/v3'

// Stablecoins / fiat — treat as USD, no taxable event
const STABLES = new Set(['USDC', 'USDT', 'DAI', 'BUSD', 'TUSD', 'FRAX', 'LUSD', 'USDP', 'GUSD', 'UST'])

interface EtherscanTx {
  timeStamp: string
  hash: string
  from: string
  to: string
  value: string        // wei
  isError: string
  gasUsed: string
  gasPrice: string
  contractAddress: string
}

interface EtherscanTokenTx {
  timeStamp: string
  hash: string
  from: string
  to: string
  value: string
  tokenName: string
  tokenSymbol: string
  tokenDecimal: string
  contractAddress: string
}

async function fetchEtherscan<T>(params: Record<string, string>): Promise<T[]> {
  const url = new URL(ETHERSCAN)
  url.searchParams.set('apikey', ETHERSCAN_KEY)
  url.searchParams.set('sort', 'asc')
  url.searchParams.set('offset', '10000')
  url.searchParams.set('page', '1')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

  const res = await fetch(url.toString(), { next: { revalidate: 300 } })
  const json = await res.json() as { status: string; result: T[] }
  if (json.status !== '1') return []
  return json.result
}

async function getEthPrices(fromTs: number, toTs: number): Promise<Map<string, number>> {
  const priceMap = new Map<string, number>()
  try {
    const url = `${COINGECKO}/coins/ethereum/market_chart/range?vs_currency=usd&from=${fromTs}&to=${toTs}`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    const data = await res.json() as { prices: [number, number][] }
    for (const [ts, price] of data.prices) {
      const day = new Date(ts).toISOString().slice(0, 10)
      priceMap.set(day, price)
    }
  } catch { /* use $0 fallback */ }
  return priceMap
}

function dayKey(ts: number): string {
  return new Date(ts * 1000).toISOString().slice(0, 10)
}

function nearestPrice(priceMap: Map<string, number>, ts: number): number {
  const day = dayKey(ts)
  if (priceMap.has(day)) return priceMap.get(day)!
  // Search ±3 days
  for (let i = 1; i <= 3; i++) {
    const d = new Date(ts * 1000)
    d.setDate(d.getDate() - i)
    const k = d.toISOString().slice(0, 10)
    if (priceMap.has(k)) return priceMap.get(k)!
  }
  return 0
}

export async function POST(req: NextRequest) {
  if (!rateLimit(getIp(req), 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let address: string
  let chain: string
  try {
    const body = await req.json() as { address: string; chain: string }
    address = (body.address || '').trim().toLowerCase()
    chain = body.chain || 'eth'
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (!address) return NextResponse.json({ error: 'Address required' }, { status: 400 })

  if (chain === 'eth' && !ETH_ADDRESS_REGEX.test(address)) {
    return NextResponse.json({ error: 'Invalid Ethereum address. Must be 0x followed by 40 hex characters.' }, { status: 400 })
  }

  if (chain === 'eth') {
    // Fetch normal ETH transactions
    const [normalTxs, tokenTxs] = await Promise.all([
      fetchEtherscan<EtherscanTx>({ module: 'account', action: 'txlist', address }),
      fetchEtherscan<EtherscanTokenTx>({ module: 'account', action: 'tokentx', address }),
    ])

    if (normalTxs.length === 0 && tokenTxs.length === 0) {
      return NextResponse.json({ error: 'No transactions found for this address.' }, { status: 404 })
    }

    // Get date range for price lookup
    const allTs = [
      ...normalTxs.map(t => parseInt(t.timeStamp)),
      ...tokenTxs.map(t => parseInt(t.timeStamp)),
    ].filter(Boolean)
    const minTs = Math.min(...allTs)
    const maxTs = Math.max(...allTs) + 86400

    const priceMap = await getEthPrices(minTs, maxTs)

    const transactions: RawTransaction[] = []

    // Normal ETH transfers
    for (const tx of normalTxs) {
      if (tx.isError === '1') continue
      const valueEth = parseInt(tx.value) / 1e18
      if (valueEth < 0.000001) continue // dust

      const ts = parseInt(tx.timeStamp)
      const ethPrice = nearestPrice(priceMap, ts)
      const gasEth = (parseInt(tx.gasUsed) * parseInt(tx.gasPrice)) / 1e18
      const gasFee = gasEth * ethPrice
      const isOutgoing = tx.from.toLowerCase() === address

      transactions.push({
        date: new Date(ts * 1000),
        type: isOutgoing ? 'transfer_out' : 'transfer_in',
        asset: 'ETH',
        amount: valueEth,
        priceUsd: ethPrice,
        feeUsd: isOutgoing ? gasFee : 0,
        totalUsd: valueEth * ethPrice,
        notes: `tx:${tx.hash.slice(0, 10)}`,
      })
    }

    // ERC-20 token transfers
    const seenHashes = new Set<string>()
    for (const tx of tokenTxs) {
      const sym = tx.tokenSymbol.toUpperCase()
      if (STABLES.has(sym)) continue // stables = fiat, no tax event
      if (seenHashes.has(tx.hash + sym)) continue
      seenHashes.add(tx.hash + sym)

      const decimals = parseInt(tx.tokenDecimal) || 18
      const amount = parseInt(tx.value) / Math.pow(10, decimals)
      if (amount < 0.000001) continue

      const ts = parseInt(tx.timeStamp)
      const isOutgoing = tx.from.toLowerCase() === address

      // We don't have token prices — mark as $0 with a note
      transactions.push({
        date: new Date(ts * 1000),
        type: isOutgoing ? 'transfer_out' : 'transfer_in',
        asset: sym,
        amount,
        priceUsd: 0, // no price data for arbitrary ERC-20s
        feeUsd: 0,
        totalUsd: 0,
        notes: `erc20:${tx.hash.slice(0, 10)} — price unknown, verify manually`,
      })
    }

    transactions.sort((a, b) => a.date.getTime() - b.date.getTime())

    return NextResponse.json({
      chain: 'eth',
      address,
      transactionCount: transactions.length,
      normalCount: normalTxs.filter(t => t.isError !== '1' && parseInt(t.value) / 1e18 > 0.000001).length,
      tokenCount: tokenTxs.length,
      transactions: transactions.map(t => ({ ...t, date: t.date.toISOString() })),
      warning: transactions.some(t => t.priceUsd === 0 && t.asset !== 'ETH')
        ? 'Some ERC-20 token prices are unknown ($0). Review these transactions manually.'
        : null,
    })
  }

  return NextResponse.json({ error: 'Only ETH wallets supported currently.' }, { status: 400 })
}
