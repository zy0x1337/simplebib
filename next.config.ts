// 🎯 PWA-Pattern: Next.js PWA Integration
// ✅ TypeScript Strict Mode
// ⚡ Performance-Critical: Optimized Build
// 📱 App-like UX: Standalone PWA

import type { NextConfig } from 'next'
import withPWA from 'next-pwa'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: true, // Für lokale Blob-URLs
  },
}

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Nur in Production
})(nextConfig)
