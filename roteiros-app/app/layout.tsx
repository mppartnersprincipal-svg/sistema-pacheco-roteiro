import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PachecoSolar — Gerador de Roteiros',
  description: 'Squad de IA para geração de roteiros de vídeo',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-solar-dark">
        {children}
      </body>
    </html>
  )
}
