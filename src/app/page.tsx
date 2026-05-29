import Link from 'next/link'

const trustBadges = [
  'IRS Compliant',
  '256-bit encryption',
  'No account required',
  '100% private',
  'Instant PDF',
]

const stats = [
  { value: '46M+', label: 'US crypto investors', sub: 'who need to file' },
  { value: '25%', label: 'IRS compliance rate', sub: 'only 1 in 4 files correctly' },
  { value: '14 hrs', label: 'saved vs manual', sub: 'average per tax year' },
  { value: '3 min', label: 'to Form 8949', sub: 'from CSV upload to download' },
]

const steps = [
  {
    num: '01',
    title: 'Export your CSV',
    desc: 'Log into Coinbase, Kraken, or Binance. Export your transaction history as CSV. We show you exactly where to click.',
    note: 'Takes about 30 seconds per exchange.',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 16V4m0 12-4-4m4 4 4-4M4 20h16" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Upload & calculate',
    desc: 'Drag and drop your CSV. We auto-detect the exchange format and calculate every gain and loss using IRS FIFO method.',
    note: '100% in-browser. Your data never leaves your device.',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M9 12h6M9 16h4" />
        <path d="M7 8h.01" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Download Form 8949',
    desc: 'Get a formatted PDF with short-term and long-term gains, ready to import into TurboTax or hand to your accountant.',
    note: 'Compatible with TurboTax, H&R Block, and any CPA.',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <polyline points="9,15 12,18 15,15" />
      </svg>
    ),
  },
]

const whyNow = [
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
    title: 'IRS now gets your trade data',
    desc: 'Form 1099-DA means Coinbase sends your full trade history directly to the IRS — just like stock brokers. They know what you sold.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
      </svg>
    ),
    title: 'Every trade is taxable',
    desc: 'Buy → Sell. BTC → ETH swap. Spending crypto. All taxable events. Manual calculation across hundreds of trades takes days.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: '$29 vs. $800/hour',
    desc: 'Accountants charge $400–$800/hr for crypto tax situations. CryptoTax Simple does the same FIFO math instantly, for $29.',
  },
]

const plans = [
  {
    name: 'Simple',
    price: '$29',
    desc: 'For casual investors',
    highlight: false,
    features: [
      'Up to 100 transactions',
      'Coinbase, Kraken, Binance',
      'Form 8949 PDF',
      'TurboTax import',
      'Short & long-term split',
    ],
  },
  {
    name: 'Standard',
    price: '$49',
    desc: 'Most Popular',
    highlight: true,
    features: [
      'Up to 500 transactions',
      'All exchanges supported',
      'Form 8949 PDF',
      'TurboTax import',
      'Per-coin breakdown',
      'Email support',
    ],
  },
  {
    name: 'Pro',
    price: '$99',
    desc: 'For active traders',
    highlight: false,
    features: [
      'Unlimited transactions',
      'All exchanges supported',
      'Form 8949 PDF',
      'TurboTax import',
      'Full audit trail',
      'Priority support',
    ],
  },
]

const faqs = [
  {
    q: 'What is Form 8949 and why do I need it?',
    a: 'Form 8949 is the IRS form where you report every crypto sale. You list when you bought, when you sold, proceeds, cost basis, and gain or loss. Every crypto investor who sold, traded, or spent crypto must file this.',
  },
  {
    q: 'Is my financial data safe?',
    a: 'Yes — all calculations happen entirely in your browser using JavaScript. Your CSV file is never uploaded to our servers. We have no access to your financial data.',
  },
  {
    q: 'What if I used multiple exchanges?',
    a: 'Upload one CSV per exchange. Results from all exchanges combine into one tax report. Standard and Pro plans support multiple CSV uploads.',
  },
  {
    q: 'Does this work with TurboTax?',
    a: "Yes. The Form 8949 we generate contains all the data TurboTax needs. You can also manually enter the summary totals into TurboTax's crypto section.",
  },
  {
    q: "What if I only bought and never sold?",
    a: "You owe no taxes — buying crypto is not a taxable event. You only owe taxes when you sell, trade, or spend crypto. Good news: upload anyway to keep records for future years.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">₿</span>
            </div>
            <span className="font-semibold text-white text-sm tracking-tight">CryptoTax Simple</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors hidden md:block">
              How it works
            </a>
            <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors hidden md:block">
              Pricing
            </a>
            <Link
              href="/upload"
              className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors"
            >
              Get Started →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="relative bg-slate-950 text-white pt-32 pb-24 overflow-hidden"
        style={{
          backgroundImage: [
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '64px 64px',
        }}
      >
        {/* soft radial glow behind headline */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-slate-300 text-xs font-medium px-3.5 py-1.5 rounded-full mb-8">
            <span className="pulse-dot w-2 h-2 bg-emerald-400 rounded-full" />
            IRS Form 1099-DA 2025 Season Open
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-7xl font-bold text-white mb-6 leading-[1.05]"
            style={{ letterSpacing: '-0.03em' }}
          >
            Your crypto taxes,<br />
            <span className="text-indigo-400">done in 3 minutes.</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg text-slate-400 max-w-xl mb-10 leading-relaxed">
            Upload your exchange CSV. We calculate every gain and loss using the IRS FIFO method.
            Download Form 8949 ready for TurboTax.{' '}
            <span className="text-slate-300 font-medium">No accountant needed.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 mb-12">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors text-base shadow-lg shadow-indigo-900/40"
            >
              Calculate My Crypto Taxes
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-medium px-6 py-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors text-base"
            >
              See how it works
            </a>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
            {trustBadges.map((badge) => (
              <span key={badge} className="flex items-center gap-1.5 text-xs text-slate-500">
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-slate-900 border-b border-white/5 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {stats.map((s) => (
              <div key={s.label} className="bg-slate-900 px-8 py-8 text-center">
                <div
                  className="text-4xl font-bold text-white mb-1 font-mono tracking-tight"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {s.value}
                </div>
                <div className="text-sm font-medium text-slate-200 mb-0.5">{s.label}</div>
                <div className="text-xs text-slate-500">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">How it works</p>
            <h2
              className="text-4xl font-bold text-slate-900"
              style={{ letterSpacing: '-0.02em' }}
            >
              Three steps. No technical knowledge needed.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((step) => (
              <div key={step.num} className="group">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                    {step.icon}
                  </div>
                  <span
                    className="text-4xl font-bold text-slate-100 font-mono select-none"
                    style={{ letterSpacing: '-0.04em' }}
                    aria-hidden="true"
                  >
                    {step.num}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2 tracking-tight">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed mb-3 text-sm">{step.desc}</p>
                <p className="text-xs text-slate-400 italic">{step.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Now ── */}
      <section className="bg-slate-900 text-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">Why now</p>
            <h2
              className="text-4xl font-bold text-white"
              style={{ letterSpacing: '-0.02em' }}
            >
              You can&apos;t ignore crypto taxes anymore.
            </h2>
            <p className="text-slate-400 mt-3 text-lg">The IRS changed the rules in 2025.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {whyNow.map((item) => (
              <div
                key={item.title}
                className="relative bg-white/[0.04] border border-white/[0.07] rounded-2xl p-7 hover:bg-white/[0.07] transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-5">
                  {item.icon}
                </div>
                <h3 className="text-base font-semibold text-white mb-2 tracking-tight">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Privacy differentiator ── */}
      <section className="bg-white py-20 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-4">Built different</p>
              <h2 className="text-4xl font-bold text-slate-900 leading-tight mb-6">
                Your financial data<br />
                <span className="text-indigo-600">cannot be breached.</span>
              </h2>
              <p className="text-lg text-slate-500 mb-6 leading-relaxed">
                Every other crypto tax tool stores your transaction history on their servers.
                That means data breaches, privacy risks, and trusting a company with your financial life.
              </p>
              <p className="text-lg text-slate-700 font-medium mb-8">
                CryptoTax Simple runs 100% in your browser. Your CSV never leaves your device.
                We calculate your taxes without ever seeing them.
              </p>
              <div className="space-y-3">
                {[
                  'Transaction history processed in your browser — never transmitted',
                  'We cannot see, store, or lose your financial data',
                  'No account means no breach surface',
                  'Close the tab — all data is gone',
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="10" height="10" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-sm text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {/* Comparison card */}
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3">Other crypto tax tools</p>
                <div className="space-y-2.5">
                  {[
                    'Store your full transaction history on their servers',
                    'Require account creation with email + password',
                    'Subject to data breaches (Koinly: Dec 2025)',
                    'Can be subpoenaed for your financial data',
                  ].map(item => (
                    <div key={item} className="flex items-start gap-2.5">
                      <span className="text-red-400 text-sm mt-0.5 flex-shrink-0">✕</span>
                      <span className="text-sm text-red-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-3">CryptoTax Simple</p>
                <div className="space-y-2.5">
                  {[
                    'Zero data on our servers — mathematically impossible to breach',
                    'No account required — nothing to hack',
                    'Open architecture — you can verify the code yourself',
                    'Close the tab — your data ceases to exist',
                  ].map(item => (
                    <div key={item} className="flex items-start gap-2.5">
                      <span className="text-emerald-500 text-sm mt-0.5 flex-shrink-0">✓</span>
                      <span className="text-sm text-emerald-800">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">Pricing</p>
            <h2
              className="text-4xl font-bold text-slate-900"
              style={{ letterSpacing: '-0.02em' }}
            >
              Simple pricing. Pay once.
            </h2>
            <p className="text-slate-500 mt-3 text-lg">Preview free before paying. No credit card needed to calculate.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={
                  plan.highlight
                    ? 'relative rounded-2xl bg-indigo-600 p-8 shadow-2xl shadow-indigo-900/30 ring-1 ring-indigo-500'
                    : 'relative rounded-2xl bg-white p-8 border border-slate-200 hover:border-slate-300 transition-colors'
                }
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-emerald-400 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      Most Popular
                    </span>
                  </div>
                )}

                <p className={`text-xs font-medium uppercase tracking-widest mb-4 ${plan.highlight ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {plan.desc}
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span
                    className={`text-5xl font-bold font-mono tracking-tight ${plan.highlight ? 'text-white' : 'text-slate-900'}`}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlight ? 'text-indigo-200' : 'text-slate-400'}`}>/tax year</span>
                </div>
                <p className={`text-lg font-semibold mb-7 ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.name}</p>

                <ul className="space-y-2.5 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2.5 text-sm ${plan.highlight ? 'text-indigo-100' : 'text-slate-600'}`}>
                      <svg
                        width="14"
                        height="14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className={plan.highlight ? 'text-indigo-300 flex-shrink-0' : 'text-emerald-500 flex-shrink-0'}
                      >
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/upload"
                  className={
                    plan.highlight
                      ? 'block text-center font-semibold py-3 rounded-xl transition-colors bg-white text-indigo-600 hover:bg-indigo-50 text-sm'
                      : 'block text-center font-semibold py-3 rounded-xl transition-colors bg-indigo-600 text-white hover:bg-indigo-700 text-sm'
                  }
                >
                  Get Started →
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <span className="inline-flex items-center gap-2 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-4 py-2">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              30-day money back guarantee
            </span>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">FAQ</p>
            <h2
              className="text-4xl font-bold text-slate-900"
              style={{ letterSpacing: '-0.02em' }}
            >
              Common questions
            </h2>
          </div>

          <div className="space-y-2">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors"
              >
                <summary className="flex items-center justify-between gap-4 px-6 py-5 font-semibold text-slate-900 text-sm leading-snug select-none">
                  {item.q}
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="faq-chevron flex-shrink-0 text-slate-400"
                  >
                    <polyline points="6,9 12,15 18,9" />
                  </svg>
                </summary>
                <p className="px-6 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section
        className="relative bg-slate-950 text-white py-28 overflow-hidden"
        style={{
          backgroundImage: [
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '64px 64px',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 80% at 50% 110%, rgba(99,102,241,0.2) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <h2
            className="text-4xl sm:text-5xl font-bold text-white mb-5"
            style={{ letterSpacing: '-0.03em' }}
          >
            Stop dreading tax season.
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-lg mx-auto">
            Upload your CSV now. See your full tax report in under 3 minutes.
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base shadow-lg shadow-indigo-900/40"
          >
            Calculate My Crypto Taxes Free
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="text-xs text-slate-600 mt-5">Preview free · Pay only when you download your report</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">₿</span>
            </div>
            <span className="font-semibold text-slate-300 text-sm">CryptoTax Simple</span>
          </div>
          <p className="text-xs text-slate-600 text-center">Not tax advice. Consult a licensed tax professional for complex situations.</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <span className="text-slate-600">© {new Date().getFullYear()} CryptoTax Simple</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
