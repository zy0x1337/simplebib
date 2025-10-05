// 🎯 PWA-Pattern: Root Layout mit Theme & Metadata
// ✅ Next.js 15 kompatibel (viewport getrennt)
// ⚡ Performance-Critical: Minimal CSS
// 📱 App-like UX: Native Feel

import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SimpleBib - Dein Buch-Tracker',
  description: 'Einfacher Tracker für deine gelesenen Bücher und Buchreihen',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SimpleBib',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4f46e5',
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
