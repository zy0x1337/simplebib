// 🎯 PWA-Pattern: Root Layout mit Theme & Metadata
// ✅ Next.js 15 kompatibel (viewport getrennt)
// ⚡ Performance-Critical: Minimal CSS
// 📱 App-like UX: Native Feel

import type { Metadata, Viewport } from 'next'
import { Instrument_Serif, General_Sans } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

const instrumentSerif = Instrument_Serif({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
})

const generalSans = General_Sans({ 
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'SimpleBib — Dein persönliches Lesejournal',
  description: 'Ein wunderschönes Offline-First Tool zum Verwalten deiner Bücher und Buchreihen',
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
  themeColor: '#8fac8e',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning className={`${instrumentSerif.variable} ${generalSans.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#8fac8e" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
