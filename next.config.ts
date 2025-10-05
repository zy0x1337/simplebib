// 🎯 PWA-Pattern: Next.js PWA Integration
// ✅ TypeScript Native Support
// ⚡ Performance-Critical: Optimized Build
// 📱 App-like UX: Standalone PWA

import type { NextConfig } from 'next'
import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  scope: '/',
  sw: 'sw.js',
  reloadOnOnline: true,
})

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
}

export default withPWA(nextConfig)
