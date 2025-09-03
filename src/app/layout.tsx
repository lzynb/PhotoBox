import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PhotoBox by DeepSeek',
  description: 'A modern photo processing application built with Next.js 14',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
