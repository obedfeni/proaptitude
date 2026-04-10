import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AptitudePro — Graduate Psychometric Suite',
  description: 'Practice SHL, Kenexa, Watson-Glaser and graduate aptitude tests with adaptive learning. 200+ questions across 12 categories including Electrical Engineering.',
  keywords: ['aptitude test', 'psychometric test', 'SHL', 'Kenexa', 'Watson-Glaser', 'electrical engineering', 'numerical reasoning', 'verbal reasoning'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
