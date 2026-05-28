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
  file: File
  exchange: ExchangeType
  transactions: RawTransaction[]
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

  const addFile = useCallback(
    async (csvFile: File) => {
      setError(null)
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

  const calculateAll = () => {
    if (loadedFiles.length === 0) return
    setIsCalculating(true)

    const allTransactions = loadedFiles.flatMap((f) => f.transactions)
    const summary = calculateFIFO(allTransactions)

    const exchangeNames = loadedFiles.map((f) => f.exchange).join('+')
    const fileNames = loadedFiles.map((f) => f.file.name).join(', ')

    sessionStorage.setItem('cryptotax_summary', JSON.stringify(summary))
    sessionStorage.setItem('cryptotax_exchange', exchangeNames)
    sessionStorage.setItem('cryptotax_filename', fileNames)
    sessionStorage.removeItem('cryptotax_paid')

    router.push('/results')
  }

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
      addFile(selected)
      e.target.value = ''
    }
  }

  const selectedExchangeData = EXCHANGES.find((ex) => ex.id === selectedExchange)
  const totalTransactions = loadedFiles.reduce((s, f) => s + f.transactions.length, 0)

  return (
    <div className="min-h-screen bg-slate-50">
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
              const borderColor =
                lf.exchange === 'coinbase'
                  ? 'border-l-blue-400'
                  : lf.exchange === 'kraken'
                  ? 'border-l-purple-400'
                  : 'border-l-yellow-400'
              return (
                <div
                  key={lf.id}
                  className={`flex items-center justify-between bg-white border border-slate-200 border-l-4 ${borderColor} rounded-xl px-4 py-3.5 shadow-sm`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{ex?.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 capitalize">{lf.exchange}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{lf.file.name} · {lf.transactions.length} transactions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Ready
                    </span>
                    <button
                      onClick={() => removeFile(lf.id)}
                      className="text-slate-300 hover:text-red-400 transition-colors text-xl leading-none w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-50"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

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
            onClick={calculateAll}
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
