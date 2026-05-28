import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Nav */}
      <nav className="border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">₿</span>
            </div>
            <span className="font-semibold text-slate-900 text-lg">CryptoTax Simple</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-slate-500 hover:text-slate-900 transition-colors hidden md:block">
              How it works
            </a>
            <a href="#pricing" className="text-sm text-slate-500 hover:text-slate-900 transition-colors hidden md:block">
              Pricing
            </a>
            <Link
              href="/upload"
              className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Get Started →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
            IRS-compliant · FIFO method · 2024 tax year
          </div>
          <h1 className="text-5xl font-bold text-slate-900 leading-tight mb-6">
            Your crypto taxes,<br />
            <span className="text-indigo-600">done in 3 minutes.</span>
          </h1>
          <p className="text-xl text-slate-500 mb-8 leading-relaxed">
            Upload your exchange CSV. We calculate every gain and loss using the IRS FIFO method.
            Download Form 8949 ready for TurboTax.{' '}
            <strong className="text-slate-700">No accountant needed.</strong>
          </p>
          <div className="flex flex-wrap items-center gap-4 mb-10">
            <Link
              href="/upload"
              className="bg-indigo-600 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-indigo-700 transition-colors text-lg shadow-lg shadow-indigo-200"
            >
              Calculate My Crypto Taxes →
            </Link>
            <a
              href="#how-it-works"
              className="text-slate-600 font-medium px-6 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-lg"
            >
              See how it works
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
            {['Coinbase', 'Kraken', 'Binance', 'No account required', 'Data stays in your browser'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <span className="text-emerald-500">✓</span> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-slate-50 border-y border-slate-100 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '46M+', label: 'US crypto investors', sub: 'who need to file' },
              { value: '25%', label: 'IRS compliance rate', sub: 'only 1 in 4 files correctly' },
              { value: '14 hrs', label: 'saved vs manual', sub: 'average per tax year' },
              { value: '3 min', label: 'to Form 8949', sub: 'from CSV upload to download' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-indigo-600 mb-1">{s.value}</div>
                <div className="text-sm font-semibold text-slate-800">{s.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">How it works</h2>
          <p className="text-lg text-slate-500">Three steps. No technical knowledge needed.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              step: '01', color: 'bg-indigo-50 text-indigo-600',
              title: 'Export your CSV',
              desc: 'Log into Coinbase, Kraken, or Binance. Export your transaction history as CSV. We show you exactly where to click.',
              note: 'Takes about 30 seconds per exchange.',
            },
            {
              step: '02', color: 'bg-violet-50 text-violet-600',
              title: 'Upload & calculate',
              desc: 'Drag and drop your CSV file. We auto-detect the exchange format and calculate gains/losses using IRS FIFO method.',
              note: '100% in-browser. Your data never reaches our servers.',
            },
            {
              step: '03', color: 'bg-emerald-50 text-emerald-600',
              title: 'Download Form 8949',
              desc: 'Get a formatted PDF with short-term and long-term gains, ready to import into TurboTax or hand to your accountant.',
              note: 'Compatible with TurboTax, H&R Block, and any CPA.',
            },
          ].map((item) => (
            <div key={item.step}>
              <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center text-lg font-bold mb-5`}>
                {item.step}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-500 mb-2 leading-relaxed">{item.desc}</p>
              <p className="text-sm text-slate-400 italic">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why now */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Why you can&apos;t ignore crypto taxes anymore</h2>
            <p className="text-slate-400 text-lg">The IRS changed the rules in 2025.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🔍',
                title: 'IRS now gets your trade data',
                desc: 'Form 1099-DA means Coinbase sends your full trade history directly to the IRS — just like stock brokers. They know what you sold.',
              },
              {
                icon: '📊',
                title: 'Every trade is taxable',
                desc: 'Buy → Sell. BTC → ETH swap. Spending crypto. All taxable events. Manual calculation across hundreds of trades takes days.',
              },
              {
                icon: '💸',
                title: '$29 vs. $800/hour',
                desc: 'Accountants charge $400–$800/hr for crypto tax situations. CryptoTax Simple does the same FIFO math instantly, for $29.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-slate-800 rounded-2xl p-6">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple pricing</h2>
          <p className="text-lg text-slate-500">Pay once per tax year. Preview free before paying.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              name: 'Simple', price: '$29', period: '/tax year', desc: 'For casual investors', highlight: false,
              features: ['Up to 100 transactions', 'Coinbase, Kraken, Binance', 'Form 8949 PDF', 'TurboTax import', 'Short & long-term split'],
            },
            {
              name: 'Standard', price: '$49', period: '/tax year', desc: 'Most popular', highlight: true,
              features: ['Up to 500 transactions', 'All exchanges', 'Form 8949 PDF', 'TurboTax import', 'Per-coin breakdown', 'Email support'],
            },
            {
              name: 'Pro', price: '$99', period: '/tax year', desc: 'For active traders', highlight: false,
              features: ['Unlimited transactions', 'All exchanges', 'Form 8949 PDF', 'TurboTax import', 'Full audit trail', 'Priority support'],
            },
          ].map((plan) => (
            <div key={plan.name} className={`rounded-2xl p-8 border ${plan.highlight ? 'border-indigo-500 bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'border-slate-200 bg-white'}`}>
              <div className={`text-sm font-medium mb-2 ${plan.highlight ? 'text-indigo-200' : 'text-slate-500'}`}>{plan.desc}</div>
              <div className="text-4xl font-bold mb-1">
                {plan.price}
                <span className={`text-base font-normal ${plan.highlight ? 'text-indigo-200' : 'text-slate-400'}`}>{plan.period}</span>
              </div>
              <div className={`text-lg font-semibold mb-6 ${plan.highlight ? 'text-white' : 'text-slate-800'}`}>{plan.name}</div>
              <ul className="space-y-2.5 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-indigo-100' : 'text-slate-600'}`}>
                    <span className={plan.highlight ? 'text-indigo-300' : 'text-emerald-500'}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/upload" className={`block text-center font-semibold py-3 rounded-xl transition-colors ${plan.highlight ? 'bg-white text-indigo-600 hover:bg-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                Get Started
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-slate-400 mt-6">
          Preview full results free before paying. No credit card required to calculate.
        </p>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 border-t border-slate-100 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">Common questions</h2>
          <div className="space-y-4">
            {[
              { q: 'What is Form 8949 and why do I need it?', a: 'Form 8949 is the IRS form where you report every crypto sale. You list when you bought, when you sold, proceeds, cost basis, and gain or loss. Every crypto investor who sold, traded, or spent crypto must file this.' },
              { q: 'Is my financial data safe?', a: 'Yes — all calculations happen entirely in your browser using JavaScript. Your CSV file is never uploaded to our servers. We have no access to your financial data.' },
              { q: 'What if I used multiple exchanges?', a: 'Upload one CSV per exchange. Results from all exchanges combine into one tax report. Standard and Pro plans support multiple CSV uploads.' },
              { q: 'Does this work with TurboTax?', a: 'Yes. The Form 8949 we generate contains all the data TurboTax needs. You can also manually enter the summary totals into TurboTax\'s crypto section.' },
              { q: 'What if I only bought and never sold?', a: 'You owe no taxes — buying crypto is not a taxable event. You only owe taxes when you sell, trade, or spend crypto. Good news: upload anyway to keep records for future years.' },
            ].map((item) => (
              <div key={item.q} className="bg-white rounded-xl p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">{item.q}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold text-slate-900 mb-4">Stop dreading tax season.</h2>
        <p className="text-xl text-slate-500 mb-8">Upload your CSV now. See your full tax report in under 3 minutes.</p>
        <Link href="/upload" className="inline-block bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors text-lg shadow-lg shadow-indigo-200">
          Calculate My Crypto Taxes Free →
        </Link>
        <p className="text-sm text-slate-400 mt-4">Preview free · Pay only when you download your report</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">₿</span>
            </div>
            <span className="font-semibold text-slate-700">CryptoTax Simple</span>
          </div>
          <p className="text-xs text-slate-400 text-center">Not tax advice. Consult a licensed tax professional for complex situations.</p>
          <p className="text-xs text-slate-400">© 2025 CryptoTax Simple</p>
        </div>
      </footer>
    </div>
  )
}
