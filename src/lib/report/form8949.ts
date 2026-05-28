import type { TaxSummary } from '../types'

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

function formatDate(dateStr: string): string {
  if (!dateStr || dateStr === '2009-01-03') return 'Unknown'
  return new Date(dateStr).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

export async function downloadForm8949PDF(summary: TaxSummary, filename: string): Promise<void> {
  // Dynamic import to avoid SSR issues
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 14
  let y = margin

  // ── Header ──────────────────────────────────────────────────────────────────
  doc.setFillColor(79, 70, 229)
  doc.rect(0, 0, pageW, 18, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(255, 255, 255)
  doc.text('CryptoTax Simple — Form 8949 Tax Report', margin, 11)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US')}   File: ${filename}`, pageW - margin, 11, { align: 'right' })

  y = 26

  // ── Summary cards ────────────────────────────────────────────────────────────
  const cards = [
    { label: 'Short-Term Gains', value: formatCurrency(summary.shortTermGains), note: 'Taxed as ordinary income', color: summary.shortTermGains >= 0 ? [239, 68, 68] as [number,number,number] : [16, 185, 129] as [number,number,number] },
    { label: 'Long-Term Gains', value: formatCurrency(summary.longTermGains), note: 'Max 20% tax rate', color: summary.longTermGains >= 0 ? [239, 68, 68] as [number,number,number] : [16, 185, 129] as [number,number,number] },
    { label: 'Total Net Gain/Loss', value: formatCurrency(summary.totalGains), note: 'Combined all assets', color: summary.totalGains >= 0 ? [239, 68, 68] as [number,number,number] : [16, 185, 129] as [number,number,number] },
    { label: 'Taxable Events', value: String(summary.taxableEvents.length), note: 'Total disposals', color: [99, 102, 241] as [number,number,number] },
  ]

  const cardW = (pageW - margin * 2 - 9) / 4
  cards.forEach((card, i) => {
    const x = margin + i * (cardW + 3)
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(x, y, cardW, 22, 2, 2, 'F')
    doc.setFillColor(...card.color)
    doc.rect(x, y, 2, 22, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...card.color)
    doc.text(card.value, x + 5, y + 10)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(15, 23, 42)
    doc.text(card.label, x + 5, y + 16)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(100, 116, 139)
    doc.text(card.note, x + 5, y + 20)
  })

  y += 28

  // ── Table header ─────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(15, 23, 42)
  doc.text('Form 8949 — Sales and Other Dispositions of Capital Assets', margin, y)
  y += 5

  const cols = [
    { label: 'Description', x: margin, w: 52 },
    { label: 'Date Acquired', x: margin + 52, w: 25 },
    { label: 'Date Sold', x: margin + 77, w: 25 },
    { label: 'Proceeds', x: margin + 102, w: 28 },
    { label: 'Cost Basis', x: margin + 130, w: 28 },
    { label: 'Gain / (Loss)', x: margin + 158, w: 28 },
    { label: 'Term', x: margin + 186, w: 20 },
  ]

  // Table header row
  doc.setFillColor(241, 245, 249)
  doc.rect(margin, y, pageW - margin * 2, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(71, 85, 105)
  cols.forEach((col) => doc.text(col.label, col.x + 1, y + 4.5))
  y += 7

  // Table rows
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.8)
  let rowNum = 0

  for (const event of summary.taxableEvents) {
    if (y > pageH - 20) {
      doc.addPage()
      y = margin
      // Re-draw column headers on new page
      doc.setFillColor(241, 245, 249)
      doc.rect(margin, y, pageW - margin * 2, 7, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7)
      doc.setTextColor(71, 85, 105)
      cols.forEach((col) => doc.text(col.label, col.x + 1, y + 4.5))
      y += 7
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6.8)
    }

    const rowH = 6
    if (rowNum % 2 === 0) {
      doc.setFillColor(255, 255, 255)
    } else {
      doc.setFillColor(248, 250, 252)
    }
    doc.rect(margin, y, pageW - margin * 2, rowH, 'F')

    const isLoss = event.gain < 0
    doc.setTextColor(15, 23, 42)
    doc.text(event.description.substring(0, 38), cols[0].x + 1, y + 4)
    doc.text(formatDate(event.dateAcquired), cols[1].x + 1, y + 4)
    doc.text(formatDate(event.dateSold), cols[2].x + 1, y + 4)
    doc.text(formatCurrency(event.proceeds), cols[3].x + 1, y + 4)
    doc.text(formatCurrency(event.costBasis), cols[4].x + 1, y + 4)

    doc.setTextColor(isLoss ? 16 : 239, isLoss ? 185 : 68, isLoss ? 129 : 68)
    doc.text(formatCurrency(event.gain), cols[5].x + 1, y + 4)

    doc.setTextColor(100, 116, 139)
    doc.text(event.isLongTerm ? 'Long' : 'Short', cols[6].x + 1, y + 4)

    y += rowH
    rowNum++
  }

  // ── Totals row ───────────────────────────────────────────────────────────────
  y += 2
  doc.setDrawColor(226, 232, 240)
  doc.line(margin, y, pageW - margin, y)
  y += 4

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(15, 23, 42)
  doc.text('TOTALS', cols[0].x + 1, y)

  const totalProceeds = summary.taxableEvents.reduce((s, e) => s + e.proceeds, 0)
  const totalBasis = summary.taxableEvents.reduce((s, e) => s + e.costBasis, 0)
  doc.text(formatCurrency(totalProceeds), cols[3].x + 1, y)
  doc.text(formatCurrency(totalBasis), cols[4].x + 1, y)
  doc.setTextColor(summary.totalGains < 0 ? 16 : 239, summary.totalGains < 0 ? 185 : 68, summary.totalGains < 0 ? 129 : 68)
  doc.text(formatCurrency(summary.totalGains), cols[5].x + 1, y)

  // ── Footer disclaimer ────────────────────────────────────────────────────────
  y = pageH - 8
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(6)
  doc.setTextColor(148, 163, 184)
  doc.text(
    'Generated by CryptoTax Simple using FIFO method. This is not tax advice. Verify all figures with a licensed tax professional before filing.',
    margin,
    y
  )

  doc.save(`form-8949-${new Date().getFullYear()}.pdf`)
}
