import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Lora } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'YunoBib — Dein Buchjournal',
  description: 'Ein minimalistisches Offline-First Tool zum Verwalten deiner Bücher und Buchreihen',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'YunoBib',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // maximumScale entfernt — blockiert Android-Pinch-Zoom (Accessibility)
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f0e8' },
    { media: '(prefers-color-scheme: dark)',  color: '#1a1814' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="de"
      suppressHydrationWarning
      className={`${playfair.variable} ${lora.variable}`}
    >
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
