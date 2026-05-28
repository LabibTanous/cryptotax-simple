import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — CryptoTax Simple' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-slate-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">₿</span>
            </div>
            <span className="font-semibold text-slate-900">CryptoTax Simple</span>
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">← Back to home</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-500 mb-12">Last updated: May 2025</p>

        <div className="prose prose-slate max-w-none space-y-10">

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">The short version</h2>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <p className="text-emerald-800 font-medium">Your financial data never leaves your device.</p>
              <p className="text-emerald-700 text-sm mt-1">
                All CSV parsing and tax calculations happen entirely in your browser using JavaScript.
                Your transaction history is never uploaded to our servers. We have zero access to your financial data.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Information we collect</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              We collect minimal information to operate the service:
            </p>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start gap-3">
                <span className="text-indigo-500 mt-1 flex-shrink-0">•</span>
                <span><strong className="text-slate-800">Payment information:</strong> When you purchase a plan, Stripe processes your payment. We receive only a payment confirmation and your email address. We do not store credit card numbers.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-500 mt-1 flex-shrink-0">•</span>
                <span><strong className="text-slate-800">Email address:</strong> Used only to send your payment receipt and order confirmation.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-500 mt-1 flex-shrink-0">•</span>
                <span><strong className="text-slate-800">Usage analytics:</strong> We collect anonymized page view data (pages visited, browser type, country) using privacy-respecting analytics. No personal identifiers are collected.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. What we do NOT collect</h2>
            <ul className="space-y-2 text-slate-600">
              {[
                'Your CSV transaction files',
                'Your cryptocurrency holdings or balances',
                'Your wallet addresses',
                'Your tax calculations or results',
                'Any financial data whatsoever',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="text-emerald-500">✓</span>
                  <span>We do NOT collect {item.toLowerCase()}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. How your CSV is processed</h2>
            <p className="text-slate-600 leading-relaxed">
              When you upload a CSV file, it is read directly by your browser using the JavaScript File API.
              The file contents are parsed and calculated in your browser's memory. Results are stored
              temporarily in your browser's sessionStorage (cleared when you close the tab).
              At no point is the file or its contents transmitted over the internet.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Third-party services</h2>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start gap-3">
                <span className="text-indigo-500 mt-1 flex-shrink-0">•</span>
                <span><strong className="text-slate-800">Stripe:</strong> Processes payments. Subject to <a href="https://stripe.com/privacy" className="text-indigo-600 underline" target="_blank" rel="noopener noreferrer">Stripe's Privacy Policy</a>.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-500 mt-1 flex-shrink-0">•</span>
                <span><strong className="text-slate-800">Vercel:</strong> Hosts this website. Standard web server logs (IP, timestamp) are collected by Vercel. Subject to <a href="https://vercel.com/legal/privacy-policy" className="text-indigo-600 underline" target="_blank" rel="noopener noreferrer">Vercel's Privacy Policy</a>.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Data retention</h2>
            <p className="text-slate-600 leading-relaxed">
              Payment records are retained for 7 years as required by tax law. Email addresses used for
              receipts are retained until you request deletion. Anonymized analytics data is retained
              for up to 24 months.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Your rights</h2>
            <p className="text-slate-600 leading-relaxed">
              You may request deletion of any personal data we hold (email, payment records) by
              contacting us. Because we do not store your financial data, there is nothing to delete
              on that front.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Contact</h2>
            <p className="text-slate-600">
              Privacy questions: <a href="mailto:privacy@cryptotaxsimple.com" className="text-indigo-600 underline">privacy@cryptotaxsimple.com</a>
            </p>
          </section>

        </div>
      </div>

      <footer className="border-t border-slate-100 py-8 mt-10">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between text-xs text-slate-400">
          <span>© 2025 CryptoTax Simple</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-600">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-600">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
