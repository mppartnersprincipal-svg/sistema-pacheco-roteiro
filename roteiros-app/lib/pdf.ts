import type { Script, Review } from '@/app/page'

function sanitize(text: string) {
  return (text ?? '').replace(/[^\x00-\x7F]/g, c => {
    const map: Record<string, string> = {
      'á': 'a', 'à': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a',
      'é': 'e', 'ê': 'e', 'è': 'e', 'ë': 'e',
      'í': 'i', 'î': 'i', 'ì': 'i', 'ï': 'i',
      'ó': 'o', 'ô': 'o', 'õ': 'o', 'ò': 'o', 'ö': 'o',
      'ú': 'u', 'û': 'u', 'ù': 'u', 'ü': 'u',
      'ç': 'c', 'ñ': 'n',
      'Á': 'A', 'À': 'A', 'Â': 'A', 'Ã': 'A',
      'É': 'E', 'Ê': 'E', 'È': 'E',
      'Í': 'I', 'Î': 'I',
      'Ó': 'O', 'Ô': 'O', 'Õ': 'O',
      'Ú': 'U', 'Û': 'U',
      'Ç': 'C', '→': '->', '←': '<-', '✓': 'OK', '✗': 'X',
      '\u2014': '-', '\u2013': '-', '\u201C': '"', '\u201D': '"', '\u2018': "'", '\u2019': "'",
    }
    return map[c] ?? '?'
  })
}

export async function downloadScriptPDF(script: Script, review?: Review) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const W = 210
  const margin = 16
  const contentW = W - margin * 2
  let y = margin

  function checkPage(needed = 10) {
    if (y + needed > 280) {
      doc.addPage()
      y = margin
    }
  }

  function title(text: string, size = 16) {
    checkPage(12)
    doc.setFontSize(size)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 30, 30)
    doc.text(sanitize(text), margin, y)
    y += size * 0.5
  }

  function subtitle(text: string) {
    checkPage(8)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(180, 90, 20)
    doc.text(sanitize(text.toUpperCase()), margin, y)
    y += 5
  }

  function body(text: string, indent = 0) {
    checkPage(6)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(50, 50, 50)
    const lines = doc.splitTextToSize(sanitize(text), contentW - indent)
    doc.text(lines, margin + indent, y)
    y += lines.length * 4.5
  }

  function divider() {
    checkPage(4)
    doc.setDrawColor(220, 220, 220)
    doc.line(margin, y, W - margin, y)
    y += 5
  }

  function sectionBox(label: string, time: string, cena: string, fala: string, textoNaTela: string) {
    checkPage(30)
    const colors: Record<string, [number, number, number]> = {
      HOOK: [249, 115, 22],
      SETUP: [59, 130, 246],
      DELIVERY: [168, 85, 247],
      BODY: [168, 85, 247],
      CTA: [34, 197, 94],
    }
    const [r, g, b] = colors[label] ?? [100, 100, 100]
    doc.setFillColor(r, g, b)
    doc.roundedRect(margin, y, contentW, 5, 1, 1, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(`${sanitize(label)}  ${sanitize(time)}`, margin + 3, y + 3.5)
    y += 7

    doc.setTextColor(80, 80, 80)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.text('CENA:', margin + 2, y)
    y += 4
    body(cena, 4)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(80, 80, 80)
    doc.text('FALA:', margin + 2, y)
    y += 4
    body(`"${fala}"`, 4)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(80, 80, 80)
    doc.text('TEXTO NA TELA:', margin + 2, y)
    y += 4
    body(textoNaTela, 4)
    y += 3
  }

  // ── HEADER ──
  doc.setFillColor(249, 115, 22)
  doc.rect(0, 0, W, 22, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('PachecoSolar — Roteiro de Video', margin, 14)
  y = 30

  // Meta
  title(script.tema, 14)
  y += 2
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text([
    `Formato: ${script.formato === 'reel' ? 'Instagram Reel' : 'Anuncio Meta Ads'}`,
    `Duracao estimada: ${sanitize(script.duracaoEstimada)}`,
    `Framework: ${sanitize(script.framework)}`,
    `Data: ${new Date().toLocaleDateString('pt-BR')}`,
  ], margin, y)
  y += 20
  divider()

  // Seções
  subtitle('ROTEIRO')
  y += 2
  script.secoes.forEach(s => {
    sectionBox(s.nome, s.tempo, s.cena, s.fala, s.textoNaTela)
  })

  // Legenda
  if (script.legenda) {
    divider()
    subtitle('LEGENDA DO POST')
    body(script.legenda)
    if (script.hashtags?.length) {
      y += 2
      body(script.hashtags.join(' '))
    }
  }

  // Copy anúncio
  if (script.copyDoAnuncio) {
    divider()
    subtitle('COPY DO ANUNCIO')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('Headline:', margin, y); y += 5
    body(script.copyDoAnuncio.headline)
    doc.setFont('helvetica', 'bold')
    doc.text('Body:', margin, y); y += 5
    body(script.copyDoAnuncio.body)
    doc.setFont('helvetica', 'bold')
    doc.text('CTA:', margin, y); y += 5
    body(script.copyDoAnuncio.cta)
  }

  // Revisão
  if (review) {
    doc.addPage()
    y = margin
    doc.setFillColor(249, 115, 22)
    doc.rect(0, 0, W, 12, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Revisao + Variante A/B', margin, 8)
    y = 20

    subtitle(`PONTUACAO GERAL: ${review.pontuacaoGeral}/10`)
    y += 2
    const scores = [
      ['Gancho', review.scores.gancho],
      ['Entrega', review.scores.entrega],
      ['CTA', review.scores.cta],
      ['Adequacao ao publico', review.scores.adequacaoPublico],
      ['Producao', review.scores.producao],
    ] as const
    scores.forEach(([label, val]) => {
      body(`${label}: ${val}/10`, 0)
    })
    y += 3
    divider()

    subtitle('MELHORIAS')
    review.melhorias.forEach((m, i) => {
      body(`${i + 1}. [${m.dimensao}] ${m.problema}`)
      body(`   -> ${m.correcao}`)
      y += 1
    })
    divider()

    subtitle('VARIANTE A/B')
    body(`Gancho: "${review.varianteAB.gancho}"`)
    body(`Driver: ${review.varianteAB.driverPsicologico}`)
    body(`Hipotese: ${review.varianteAB.hipoteseTestada}`)
    y += 3
    body(review.varianteAB.roteiro)
  }

  const filename = `roteiro-${sanitize(script.tema).slice(0, 30).trim().replace(/\s+/g, '-').toLowerCase()}.pdf`
  doc.save(filename)
}
