'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { TaxSummary } from '@/lib/types'
import { downloadForm8949PDF } from '@/lib/report/form8949'

function fmt(val: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

function fmtDate(dateStr: string): string {
  if (!dateStr || dateStr === '2009-01-03') return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtNum(n: number, decimals = 6): string {
  return n.toFixed(decimals).replace(/\.?0+$/, '')
}

export default function ResultsPage() {
  const router = useRouter()
  const [summary, setSummary] = useState<TaxSummary | null>(null)
  const [exchange, setExchange] = useState<string>('')
  const [filename, setFilename] = useState<string>('')
  const [isDownloading, setIsDownloading] = useState(false)
  const [activeTab, setActiveTab] = useState<'summary' | 'events' | 'assets'>('summary')

  useEffect(() => {
    const raw = sessionStorage.getItem('cryptotax_summary')
    if (!raw) {
      router.push('/upload')
      return
    }
    setSummary(JSON.parse(raw) as TaxSummary)
    setExchange(sessionStorage.getItem('cryptotax_exchange') || '')
    setFilename(sessionStorage.getItem('cryptotax_filename') || 'transaction-history.csv')
  }, [router])

  const handleDownload = async () => {
    if (!summary) return
    setIsDownloading(true)
    try {
      await downloadForm8949PDF(summary, filename)
    } catch (err) {
      console.error(err)
      alert('PDF generation failed. Please try again.')
    }
    setIsDownloading(false)
  }

  if (!summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500">Loading your results...</p>
        </div>
      </div>
    )
  }

  const estimatedShortTax = Math.max(0, summary.shortTermGains) * 0.22
  const estimatedLongTax = Math.max(0, summary.longTermGains) * 0.15
  const estimatedTotal = estimatedShortTax + estimatedLongTax

  const assetList = Object.entries(summary.assets).sort((a, b) => Math.abs(b[1].realizedGain) - Math.abs(a[1].realizedGain))
  const shortTermEvents = summary.taxableEvents.filter((e) => !e.isLongTerm)
  const longTermEvents = summary.taxableEvents.filter((e) => e.isLongTerm)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 no-print">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">₿</span>
            </div>
            <span className="font-semibold text-slate-900">CryptoTax Simple</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/upload" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
              ← Upload another file
            </Link>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {isDownloading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Generating...</>
              ) : (
                <>⬇ Download Form 8949 PDF</>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Your Tax Report</h1>
            <p className="text-slate-500 text-sm">
              {exchange && <span className="capitalize">{exchange}</span>}
              {filename && <span> · {filename}</span>}
              <span> · {summary.totalTransactions} total transactions · FIFO method</span>
            </p>
          </div>
          <div className="text-right text-sm text-slate-400">
            Tax year {new Date().getFullYear() - 1}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Short-Term Gains',
              value: fmt(summary.shortTermGains),
              sub: `${shortTermEvents.length} events · taxed as income`,
              positive: summary.shortTermGains >= 0,
              neutral: summary.shortTermGains === 0,
            },
            {
              label: 'Long-Term Gains',
              value: fmt(summary.longTermGains),
              sub: `${longTermEvents.length} events · max 20% rate`,
              positive: summary.longTermGains >= 0,
              neutral: summary.longTermGains === 0,
            },
            {
              label: 'Total Net Gain/Loss',
              value: fmt(summary.totalGains),
              sub: 'Combined all assets',
              positive: summary.totalGains >= 0,
              neutral: summary.totalGains === 0,
              bold: true,
            },
            {
              label: 'Estimated Tax Owed',
              value: fmt(estimatedTotal),
              sub: '22% short-term · 15% long-term',
              positive: true,
              isEstimate: true,
            },
          ].map((card) => (
            <div key={card.label} className={`bg-white rounded-2xl p-5 border ${card.bold ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-slate-200'}`}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{card.label}</p>
              <p className={`text-2xl font-bold mb-1 ${
                card.isEstimate ? 'text-slate-900' :
                card.neutral ? 'text-slate-400' :
                card.positive ? 'text-red-500' : 'text-emerald-500'
              }`}>
                {card.value}
              </p>
              <p className="text-xs text-slate-400">{card.sub}</p>
              {card.isEstimate && (
                <p className="text-xs text-amber-500 mt-1">Rough estimate only</p>
              )}
            </div>
          ))}
        </div>

        {/* Good news banner if net loss */}
        {summary.totalGains < 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-semibold text-emerald-800">Net Loss — You may owe $0 in crypto taxes</p>
              <p className="text-sm text-emerald-600">
                You have a net capital loss of {fmt(Math.abs(summary.totalGains))}. You can deduct up to $3,000 against other income and carry forward the rest.
              </p>
            </div>
          </div>
        )}

        {/* Disclaimer banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-3">
          <span className="text-lg flex-shrink-0">⚠️</span>
          <p className="text-sm text-amber-700">
            <strong>Preview only.</strong> Download the full Form 8949 PDF to import into TurboTax or give to your accountant.
            The estimated tax above assumes 22% short-term and 15% long-term rates — your actual rates depend on your total income.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit no-print">
          {(['summary', 'events', 'assets'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'events' ? `Taxable Events (${summary.taxableEvents.length})` :
               tab === 'assets' ? `Assets (${assetList.length})` : 'Summary'}
            </button>
          ))}
        </div>

        {/* Summary tab */}
        {activeTab === 'summary' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">What you need to file</h3>
              <div className="space-y-3">
                {[
                  { doc: 'Form 8949', desc: 'Lists every individual sale (download below)', done: true },
                  { doc: 'Schedule D', desc: 'Summarizes total gains/losses by category', done: false },
                  { doc: 'Form 1040', desc: 'Your main tax return (references Schedule D)', done: false },
                ].map((item) => (
                  <div key={item.doc} className="flex items-start gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 ${item.done ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                      {item.done ? '✓' : '○'}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.doc}</p>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Breakdown by term</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Short-term (held &lt; 1 year)</span>
                    <span className={`font-semibold ${summary.shortTermGains >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {fmt(summary.shortTermGains)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-red-400 h-2 rounded-full"
                      style={{ width: `${Math.min(100, Math.abs(summary.shortTermGains) / (Math.abs(summary.shortTermGains) + Math.abs(summary.longTermGains) + 0.01) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{shortTermEvents.length} disposal events</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Long-term (held &gt; 1 year)</span>
                    <span className={`font-semibold ${summary.longTermGains >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {fmt(summary.longTermGains)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-emerald-400 h-2 rounded-full"
                      style={{ width: `${Math.min(100, Math.abs(summary.longTermGains) / (Math.abs(summary.shortTermGains) + Math.abs(summary.longTermGains) + 0.01) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{longTermEvents.length} disposal events</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Taxable events tab */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Asset</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Acquired</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Sold</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Proceeds</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cost Basis</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Gain / Loss</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Term</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.taxableEvents.slice(0, 200).map((event, i) => (
                    <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <td className="px-4 py-3 font-medium text-slate-800">{event.description}</td>
                      <td className="px-4 py-3 text-slate-500">{fmtDate(event.dateAcquired)}</td>
                      <td className="px-4 py-3 text-slate-500">{fmtDate(event.dateSold)}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{fmt(event.proceeds)}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{fmt(event.costBasis)}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${event.gain >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {event.gain >= 0 ? '+' : ''}{fmt(event.gain)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${event.isLongTerm ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                          {event.isLongTerm ? 'Long' : 'Short'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {summary.taxableEvents.length > 200 && (
                  <tfoot>
                    <tr>
                      <td colSpan={7} className="px-4 py-3 text-center text-sm text-slate-400">
                        Showing first 200 of {summary.taxableEvents.length} events. Download PDF for complete report.
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        {/* Assets tab */}
        {activeTab === 'assets' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Asset</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Bought</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Sold</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Holdings Left</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Realized Gain/Loss</th>
                </tr>
              </thead>
              <tbody>
                {assetList.map(([symbol, data], i) => (
                  <tr key={symbol} className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-700 text-xs font-bold">{symbol.slice(0, 2)}</span>
                        </div>
                        <span className="font-semibold text-slate-800">{symbol}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right text-slate-600">{fmtNum(data.totalBought)}</td>
                    <td className="px-5 py-3 text-right text-slate-600">{fmtNum(data.totalSold)}</td>
                    <td className="px-5 py-3 text-right text-slate-600">{fmtNum(data.currentHoldings)}</td>
                    <td className={`px-5 py-3 text-right font-semibold ${data.realizedGain >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {data.realizedGain >= 0 ? '+' : ''}{fmt(data.realizedGain)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Download CTA */}
        <div className="mt-8 bg-indigo-600 rounded-2xl p-8 text-white text-center no-print">
          <h3 className="text-xl font-bold mb-2">Ready to file?</h3>
          <p className="text-indigo-200 mb-6">
            Download your Form 8949 PDF. Import it directly into TurboTax, or hand it to your accountant.
          </p>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-white text-indigo-600 font-bold px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors text-lg disabled:opacity-60 flex items-center gap-2 mx-auto"
          >
            {isDownloading ? (
              <><span className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></span> Generating PDF...</>
            ) : (
              <>⬇ Download Form 8949 PDF — Free Preview</>
            )}
          </button>
          <p className="text-indigo-300 text-sm mt-3">Complete report · {summary.taxableEvents.length} taxable events · all assets</p>
        </div>
      </div>
    </div>
  )
}
