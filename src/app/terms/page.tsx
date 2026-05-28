import Link from 'next/link'

export const metadata = { title: 'Terms of Service — CryptoTax Simple' }

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-slate-500 mb-12">Last updated: May 2025</p>

        <div className="space-y-10">

          <section>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
              <p className="text-amber-800 font-semibold">Not tax advice</p>
              <p className="text-amber-700 text-sm mt-1">
                CryptoTax Simple is a calculation tool, not a tax advisor. Output is not legal or tax advice.
                Consult a licensed CPA or tax professional before filing your return.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Acceptance of terms</h2>
            <p className="text-slate-600 leading-relaxed">
              By accessing or using CryptoTax Simple ("the Service"), you agree to be bound by these
              Terms of Service. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Description of service</h2>
            <p className="text-slate-600 leading-relaxed">
              CryptoTax Simple provides a browser-based tool to calculate cryptocurrency capital gains
              and losses using the FIFO (First In, First Out) method, and to generate a Form 8949
              report. The Service supports CSV exports from Coinbase, Kraken, and Binance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Not tax or legal advice</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              The Service provides calculations for informational purposes only. CryptoTax Simple:
            </p>
            <ul className="space-y-2 text-slate-600">
              {[
                'Is not a licensed tax preparer, CPA, or financial advisor',
                'Does not provide tax advice, legal advice, or investment advice',
                'Does not guarantee the accuracy, completeness, or suitability of calculations for your specific tax situation',
                'Is not responsible for errors in the CSV files you provide',
                'Does not cover all taxable events (DeFi, NFTs, self-custody wallets may not be supported)',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Payment and refunds</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              Access to the Form 8949 PDF download requires a one-time payment per tax year.
              Payments are processed by Stripe.
            </p>
            <p className="text-slate-600 leading-relaxed mb-3">
              <strong className="text-slate-800">Refund policy:</strong> If the Service fails to generate your Form 8949 PDF due to a technical
              error on our part, you are entitled to a full refund. Refunds are not provided for
              user error (incorrect CSV format, unsupported exchange) or dissatisfaction with
              calculation results that are mathematically correct.
            </p>
            <p className="text-slate-600 leading-relaxed">
              To request a refund, contact <a href="mailto:support@cryptotaxsimple.com" className="text-indigo-600 underline">support@cryptotaxsimple.com</a> within 30 days of purchase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Accuracy and limitations</h2>
            <p className="text-slate-600 leading-relaxed">
              The Service uses the FIFO method as described in IRS Publication 544. Results depend
              entirely on the accuracy and completeness of the CSV data you provide. Missing
              transactions, incorrect exchange formats, or incomplete history will produce incorrect
              results. You are responsible for verifying all output before filing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Limitation of liability</h2>
            <p className="text-slate-600 leading-relaxed">
              To the maximum extent permitted by law, CryptoTax Simple shall not be liable for any
              indirect, incidental, special, or consequential damages arising from use of the Service,
              including but not limited to IRS penalties, interest, or audit costs resulting from
              incorrect tax filings. Our total liability is limited to the amount you paid for the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Acceptable use</h2>
            <p className="text-slate-600 leading-relaxed">
              You agree not to use the Service for any unlawful purpose, to reverse-engineer the
              Service, or to attempt to access data belonging to other users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Changes to terms</h2>
            <p className="text-slate-600 leading-relaxed">
              We reserve the right to update these terms. Material changes will be posted on this
              page with an updated date. Continued use of the Service constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Contact</h2>
            <p className="text-slate-600">
              Questions about these terms: <a href="mailto:legal@cryptotaxsimple.com" className="text-indigo-600 underline">legal@cryptotaxsimple.com</a>
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
