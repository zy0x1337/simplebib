import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f2ee' },
    { media: '(prefers-color-scheme: dark)',  color: '#0e0c0b' },
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
    >
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        {/* Zodiak (display) + General Sans (body) — Fontshare */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=zodiak@300,300i,400,400i,500,700&f[]=general-sans@300,400,500,600&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --font-display: 'Zodiak';
            --font-body: 'General Sans';
          }
        ` }} />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
