// 🎯 PWA-Pattern: Root Layout mit Theme & Metadata
// ✅ TypeScript Strict Mode
// ⚡ Performance-Critical: Minimal CSS
// 📱 App-like UX: Native Feel

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SimpleBib - Dein Buch-Tracker',
  description: 'Einfacher Tracker für deine gelesenen Bücher und Buchreihen',
  manifest: '/manifest.json',
  themeColor: '#4f46e5',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SimpleBib',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
