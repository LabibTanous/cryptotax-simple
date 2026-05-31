'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { ExchangeType, RawTransaction } from '@/lib/types'
import { parseCSV, detectExchange } from '@/lib/parsers'
import { calculateFIFO } from '@/lib/calculator/fifo'

const EXCHANGES: { id: ExchangeType; name: string; icon: string; color: string; instructions: string[] }[] = [
  {
    id: 'coinbase',
    name: 'Coinbase',
    icon: '🔵',
    color: 'border-blue-300 bg-blue-50',
    instructions: [
      'Log into Coinbase.com',
      'Click your profile icon → Statements',
      'Select "Transaction History" tab',
      'Click "Generate" and download the CSV',
    ],
  },
  {
    id: 'kraken',
    name: 'Kraken',
    icon: '🟣',
    color: 'border-purple-300 bg-purple-50',
    instructions: [
      'Log into Kraken.com',
      'Go to History → Export',
      'Select "Ledgers" from the dropdown',
      'Set your date range and export CSV',
    ],
  },
  {
    id: 'binance',
    name: 'Binance',
    icon: '🟡',
    color: 'border-yellow-300 bg-yellow-50',
    instructions: [
      'Log into Binance.com',
      'Go to Wallet → Transaction History',
      'Click "Generate All Statements"',
      'Select your date range and download CSV',
    ],
  },
]

interface LoadedFile {
  id: string
  file: File | null
  label?: string
  exchange: ExchangeType
  transactions: RawTransaction[]
  warning?: string | null
}

export default function UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedExchange, setSelectedExchange] = useState<ExchangeType | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loadedFiles, setLoadedFiles] = useState<LoadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [arrowHover, setArrowHover] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [isFetchingWallet, setIsFetchingWallet] = useState(false)
  const [walletError, setWalletError] = useState<string | null>(null)
  const [showChecklist, setShowChecklist] = useState(false)
  const [checklist, setChecklist] = useState({
    otherExchanges: null as boolean | null,
    transferredCoins: null as boolean | null,
    hasDeFi: null as boolean | null,
  })

  const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB
  const ETH_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/

  const addFile = useCallback(
    async (csvFile: File) => {
      setError(null)

      if (csvFile.size > MAX_FILE_BYTES) {
        setError('File is too large. Maximum supported size is 10 MB. Please export a smaller date range.')
        return
      }

      setIsProcessing(true)

      try {
        const text = await csvFile.text()

        let exchange = selectedExchange
        if (!exchange) {
          exchange = detectExchange(text)
          if (!exchange) {
            setError('Could not auto-detect exchange. Please select your exchange above before uploading.')
            setIsProcessing(false)
            return
          }
          setSelectedExchange(exchange)
        }

        const transactions = parseCSV(text, exchange)

        if (transactions.length === 0) {
          setError('No transactions found. Make sure you exported the correct CSV type from your exchange.')
          setIsProcessing(false)
          return
        }

        // Check for duplicate exchange (replace if same exchange re-uploaded)
        setLoadedFiles((prev) => {
          const filtered = prev.filter((f) => f.exchange !== exchange)
          return [...filtered, { id: crypto.randomUUID(), file: csvFile, exchange: exchange!, transactions }]
        })
        setSelectedExchange(null) // reset for next file
      } catch (err) {
        console.error(err)
        setError('Error reading file. Please make sure it is a valid CSV file.')
      }
      setIsProcessing(false)
    },
    [selectedExchange]
  )

  const removeFile = (id: string) => {
    setLoadedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const fetchWallet = async () => {
    const addr = walletAddress.trim()
    if (!addr) return
    if (!ETH_ADDRESS_RE.test(addr)) {
      setWalletError('Invalid Ethereum address. Must start with 0x followed by 40 hex characters.')
      return
    }
    setWalletError(null)
    setIsFetchingWallet(true)
    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addr, chain: 'eth' }),
      })
      const data = await res.json() as {
        transactions?: Array<{ date: string; type: string; asset: string; amount: number; priceUsd: number; feeUsd: number; totalUsd: number; notes?: string }>
        transactionCount?: number
        warning?: string | null
        error?: string
      }
      if (!res.ok || data.error) {
        setWalletError(data.error || 'Failed to fetch wallet transactions.')
        return
      }
      const transactions: RawTransaction[] = (data.transactions || []).map(t => ({
        ...t,
        date: new Date(t.date),
        type: t.type as RawTransaction['type'],
      }))
      if (transactions.length === 0) {
        setWalletError('No transactions found for this address.')
        return
      }
      setLoadedFiles(prev => {
        const filtered = prev.filter(f => f.exchange !== 'wallet_eth')
        return [...filtered, {
          id: crypto.randomUUID(),
          file: null,
          label: `ETH Wallet ${addr.slice(0, 6)}...${addr.slice(-4)}`,
          exchange: 'wallet_eth',
          transactions,
          warning: data.warning,
        }]
      })
      setWalletAddress('')
    } catch {
      setWalletError('Network error. Please try again.')
    }
    setIsFetchingWallet(false)
  }

  const openChecklist = () => {
    if (loadedFiles.length === 0) return
    setChecklist({ otherExchanges: null, transferredCoins: null, hasDeFi: null })
    setShowChecklist(true)
  }

  const checklistComplete = checklist.otherExchanges !== null && checklist.transferredCoins !== null && checklist.hasDeFi !== null
  const checklistBlocked = checklist.otherExchanges === true || checklist.transferredCoins === true

  const calculateAll = () => {
    if (loadedFiles.length === 0) return
    setShowChecklist(false)
    setIsCalculating(true)

    const allTransactions = loadedFiles.flatMap((f) => f.transactions)
    const summary = calculateFIFO(allTransactions)

    const exchangeNames = loadedFiles.map((f) => f.exchange).join('+')
    const fileNames = loadedFiles.map((f) => f.label || f.file?.name || f.exchange).join(', ')

    sessionStorage.setItem('cryptotax_summary', JSON.stringify(summary))
    sessionStorage.setItem('cryptotax_exchange', exchangeNames)
    sessionStorage.setItem('cryptotax_filename', fileNames)
    sessionStorage.removeItem('cryptotax_paid')

    router.push('/results')
  }

  // Detect date range from loaded transactions
  const allDates = loadedFiles.flatMap(f => f.transactions.map(t => t.date))
  const earliestDate = allDates.length > 0 ? new Date(Math.min(...allDates.map(d => d.getTime()))) : null
  const latestDate = allDates.length > 0 ? new Date(Math.max(...allDates.map(d => d.getTime()))) : null
  const fmtYear = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const dropped = e.dataTransfer.files[0]
      if (dropped) {
        if (!dropped.name.endsWith('.csv')) {
          setError('Please upload a CSV file.')
          return
        }
        addFile(dropped)
      }
    },
    [addFile]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (!selected.name.endsWith('.csv')) {
        setError('Please upload a CSV file.')
        e.target.value = ''
        return
      }
      addFile(selected)
      e.target.value = ''
    }
  }

  const selectedExchangeData = EXCHANGES.find((ex) => ex.id === selectedExchange)
  const totalTransactions = loadedFiles.reduce((s, f) => s + f.transactions.length, 0)

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Verification checklist modal */}
      {showChecklist && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Quick accuracy check</h2>
              <p className="text-sm text-slate-500">3 questions to make sure your results are complete and correct.</p>
            </div>

            {/* Date range detected */}
            {earliestDate && latestDate && (
              <div className="bg-slate-50 rounded-xl p-3 mb-6 flex items-center gap-3">
                <span className="text-lg">📅</span>
                <div>
                  <p className="text-xs font-semibold text-slate-700">Date range detected in your files</p>
                  <p className="text-sm text-slate-500">{fmtYear(earliestDate)} → {fmtYear(latestDate)} · {totalTransactions} transactions</p>
                </div>
              </div>
            )}

            {/* Question 1 */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-slate-800 mb-2">
                1. Did you trade on any exchanges <span className="text-indigo-600">not yet uploaded</span>?
              </p>
              <div className="flex gap-3">
                {[{ label: 'Yes — I used other exchanges', val: true }, { label: 'No — this covers everything', val: false }].map(opt => (
                  <button key={String(opt.val)} onClick={() => setChecklist(c => ({ ...c, otherExchanges: opt.val }))}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${checklist.otherExchanges === opt.val ? (opt.val ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-emerald-500 bg-emerald-50 text-emerald-700') : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
              {checklist.otherExchanges === true && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">⚠️ Please go back and upload those CSVs too — missing exchanges will make your cost basis incorrect.</p>
              )}
            </div>

            {/* Question 2 */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-slate-800 mb-2">
                2. Did you <span className="text-indigo-600">transfer coins between exchanges</span> (e.g. bought on Coinbase, sold on Kraken)?
              </p>
              <div className="flex gap-3">
                {[{ label: 'Yes — I moved coins between exchanges', val: true }, { label: 'No — each exchange is independent', val: false }].map(opt => (
                  <button key={String(opt.val)} onClick={() => setChecklist(c => ({ ...c, transferredCoins: opt.val }))}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${checklist.transferredCoins === opt.val ? (opt.val ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-emerald-500 bg-emerald-50 text-emerald-700') : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
              {checklist.transferredCoins === true && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">⚠️ You need to upload CSVs from <strong>both</strong> exchanges so we can match the cost basis correctly.</p>
              )}
            </div>

            {/* Question 3 */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-slate-800 mb-2">
                3. Do you have <span className="text-indigo-600">DeFi, NFT, or self-custody wallet</span> activity (MetaMask, Ledger, Uniswap)?
              </p>
              <div className="flex gap-3">
                {[{ label: 'Yes — I used DeFi or self-custody', val: true }, { label: 'No — exchange only', val: false }].map(opt => (
                  <button key={String(opt.val)} onClick={() => setChecklist(c => ({ ...c, hasDeFi: opt.val }))}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${checklist.hasDeFi === opt.val ? (opt.val ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-emerald-500 bg-emerald-50 text-emerald-700') : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
              {checklist.hasDeFi === true && (
                <p className="text-xs text-amber-600 mt-2">⚠️ DeFi and self-custody wallets are not supported. Your results will be incomplete — consider a CPA for those transactions.</p>
              )}
            </div>

            {/* Actions */}
            {checklistBlocked ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                  Upload your missing exchange CSVs above first for accurate results.
                </p>
                <button onClick={() => setShowChecklist(false)} className="w-full py-3 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-slate-300 transition-colors">
                  ← Go back and add files
                </button>
                <button onClick={calculateAll} className="w-full py-3 text-sm text-slate-400 hover:text-slate-600 transition-colors">
                  Calculate anyway (results may be incomplete)
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => setShowChecklist(false)} className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-slate-300 transition-colors">
                  ← Back
                </button>
                <button
                  onClick={calculateAll}
                  disabled={!checklistComplete || isCalculating}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isCalculating ? 'Calculating...' : checklistComplete ? 'Calculate My Taxes →' : 'Answer all 3 questions'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">₿</span>
            </div>
            <span className="font-semibold text-slate-900">CryptoTax Simple</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
            <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <span className="text-slate-700 font-medium">Upload</span>
            <span className="text-slate-300 mx-1">→</span>
            <span className="w-6 h-6 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <span>Review</span>
            <span className="text-slate-300 mx-1">→</span>
            <span className="w-6 h-6 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <span>Download</span>
          </div>
          <div className="flex sm:hidden items-center gap-1.5 text-xs text-slate-500">
            <span className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">1</span>
            <span className="text-slate-300">→</span>
            <span className="w-5 h-5 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center font-bold">2</span>
            <span className="text-slate-300">→</span>
            <span className="w-5 h-5 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center font-bold">3</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Upload your CSV files</h1>
          <p className="text-slate-500">Add one file per exchange. We combine everything into one tax report.</p>
        </div>

        {/* Exchange selector */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-slate-700 mb-3">Step 1 — Select your exchange</p>
          <div className="grid grid-cols-3 gap-4">
            {EXCHANGES.map((ex) => {
              const alreadyLoaded = loadedFiles.some((f) => f.exchange === ex.id)
              const isSelected = selectedExchange === ex.id
              return (
                <button
                  key={ex.id}
                  onClick={() => setSelectedExchange(isSelected ? null : ex.id)}
                  className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative ${
                    alreadyLoaded
                      ? 'border-emerald-400 bg-emerald-50 shadow-sm shadow-emerald-100'
                      : isSelected
                      ? 'border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-100'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  {/* Top-right badge */}
                  {alreadyLoaded && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                      ✓
                    </span>
                  )}
                  {isSelected && !alreadyLoaded && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                      ✓
                    </span>
                  )}
                  <span className="text-3xl">{ex.icon}</span>
                  <span className={`font-semibold text-sm ${alreadyLoaded ? 'text-emerald-700' : isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                    {ex.name}
                  </span>
                  {alreadyLoaded ? (
                    <span className="text-xs text-emerald-600 font-medium bg-emerald-100 px-2 py-0.5 rounded-full">
                      {loadedFiles.find((f) => f.exchange === ex.id)?.transactions.length} txns loaded
                    </span>
                  ) : isSelected ? (
                    <span className="text-xs text-indigo-600 font-semibold bg-indigo-100 px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>

        {/* Instructions */}
        {selectedExchangeData && !loadedFiles.some((f) => f.exchange === selectedExchange) && (
          <div className={`mb-8 rounded-xl border-2 ${selectedExchangeData.color} p-5`}>
            <p className="text-sm font-semibold text-slate-700 mb-3">
              How to export from {selectedExchangeData.name}:
            </p>
            <ol className="space-y-2">
              {selectedExchangeData.instructions.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0 mt-0.5 shadow-sm">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Loaded files list */}
        {loadedFiles.length > 0 && (
          <div className="mb-6 space-y-2">
            {loadedFiles.map((lf) => {
              const ex = EXCHANGES.find((e) => e.id === lf.exchange)
              const isWallet = lf.exchange === 'wallet_eth' || lf.exchange === 'wallet_btc'
              const borderColor =
                lf.exchange === 'coinbase' ? 'border-l-blue-400' :
                lf.exchange === 'kraken' ? 'border-l-purple-400' :
                lf.exchange === 'binance' ? 'border-l-yellow-400' :
                'border-l-indigo-400'
              return (
                <div key={lf.id} className="space-y-1">
                  <div className={`flex items-center justify-between bg-white border border-slate-200 border-l-4 ${borderColor} rounded-xl px-4 py-3.5 shadow-sm`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{isWallet ? '🔷' : ex?.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {isWallet ? lf.label : lf.exchange.charAt(0).toUpperCase() + lf.exchange.slice(1)}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {lf.file ? lf.file.name + ' · ' : ''}{lf.transactions.length} transactions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Ready</span>
                      <button
                        onClick={() => removeFile(lf.id)}
                        aria-label="Remove file"
                        className="text-slate-300 hover:text-red-400 transition-colors text-xl leading-none w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-50"
                      >×</button>
                    </div>
                  </div>
                  {lf.warning && (
                    <p className="text-xs text-amber-600 px-2 flex items-center gap-1">⚠️ {lf.warning}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Wallet address lookup */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-slate-700 mb-3">Add ETH wallet address <span className="font-normal text-slate-400">(optional — no CSV needed)</span></p>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex gap-3 mb-3">
              <div className="flex items-center gap-2 flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <span className="text-lg">🔷</span>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={e => { setWalletAddress(e.target.value); setWalletError(null) }}
                  onKeyDown={e => e.key === 'Enter' && fetchWallet()}
                  placeholder="0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
                  className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-mono"
                />
              </div>
              <button
                onClick={fetchWallet}
                disabled={!walletAddress.trim() || isFetchingWallet}
                className="px-5 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isFetchingWallet ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Fetching...</>
                ) : 'Import →'}
              </button>
            </div>
            {walletError && <p className="text-xs text-red-600 flex items-center gap-1">⚠️ {walletError}</p>}
            {isFetchingWallet && <p className="text-xs text-indigo-500 flex items-center gap-1">⏳ Fetching from Etherscan — this can take 10–20 seconds for large wallets...</p>}
            <p className="text-xs text-slate-400">Pulls all ETH transactions automatically via Etherscan. Wallet activity is classified as transfers — upload exchange CSVs for accurate cost basis.</p>
          </div>
        </div>

        {/* Upload zone */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-slate-700 mb-3">
            Step 2 — {loadedFiles.length === 0 ? 'Upload your CSV file' : 'Add another exchange CSV (optional)'}
          </p>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50 scale-[1.01]'
                : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/30'
            }`}
          >
            {/* Animated border overlay when idle and not processing */}
            {!isDragging && !isProcessing && (
              <span
                className="drag-zone-idle pointer-events-none absolute inset-0 rounded-2xl border-2 border-dashed border-indigo-300"
                aria-hidden="true"
              />
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            {isProcessing ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-600 font-medium">Reading file...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">
                  📂
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-700 mb-1">
                    {loadedFiles.length === 0 ? 'Drop your CSV here' : '+ Add another CSV'}
                  </p>
                  <p className="text-sm text-slate-400 mb-1.5">or click to browse · .csv files only</p>
                  <p className="text-xs text-slate-400">
                    <span className="mr-1">🔵</span>Coinbase
                    <span className="mx-2 text-slate-300">·</span>
                    <span className="mr-1">🟣</span>Kraken
                    <span className="mx-2 text-slate-300">·</span>
                    <span className="mr-1">🟡</span>Binance formats supported
                  </p>
                </div>
                <div className="mt-2 bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                  Choose File
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-start gap-3 mb-6">
            <span className="text-lg flex-shrink-0">⚠️</span>
            <div>
              <p className="font-semibold mb-0.5">Error processing file</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Calculate button */}
        {loadedFiles.length > 0 && (
          <button
            onClick={openChecklist}
            disabled={isCalculating}
            onMouseEnter={() => setArrowHover(true)}
            onMouseLeave={() => setArrowHover(false)}
            className="w-full bg-indigo-600 text-white font-bold py-5 rounded-2xl hover:bg-indigo-700 transition-all duration-200 text-lg disabled:opacity-60 flex items-center justify-center gap-3 mb-6 shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-200"
          >
            {isCalculating ? (
              <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Calculating...</>
            ) : (
              <>
                Calculate My Taxes
                <span
                  className="transition-transform duration-200"
                  style={{ transform: arrowHover ? 'translateX(4px)' : 'translateX(0)' }}
                >
                  →
                </span>
                <span className="text-sm font-normal opacity-80">
                  {totalTransactions} transactions · {loadedFiles.length} exchange{loadedFiles.length > 1 ? 's' : ''}
                </span>
              </>
            )}
          </button>
        )}

        {/* Privacy note */}
        <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-slate-200">
          <span className="text-xl flex-shrink-0">🔒</span>
          <div className="text-sm text-slate-500">
            <p className="font-medium text-slate-700 mb-0.5">Your data stays in your browser</p>
            <p>All calculations run locally using JavaScript. Your CSV files are never sent to our servers. We have zero access to your financial data.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
