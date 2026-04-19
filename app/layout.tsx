import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Reputation Economy — AI Agent Track Record Scoring',
  description: 'Track, score, and evaluate AI agent performance history. Make data-driven deployment decisions with reputation-based analytics.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script defer src="https://umami.microtool.dev/script.js" data-website-id="0817b98c-b21f-4431-b953-98601c926638"></script>
      </head>
      <body className="bg-[#0d1117] text-[#c9d1d9] antialiased">{children}</body>
    </html>
  )
}
