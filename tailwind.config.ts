import type { Config } from 'tailwindcss'
import daisyui from 'daisyui'

const config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
        'book-reveal': 'bookReveal 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bookReveal: {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      backgroundImage: {
        'paper-texture': "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E\")",
        'dot-pattern': "radial-gradient(circle at 1px 1px, oklch(var(--bc) / 0.08) 1px, transparent 0)",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        light: {
          'primary': '#5d7a5d',
          'primary-focus': '#4a634a',
          'primary-content': '#faf8f5',
          'secondary': '#b8956e',
          'secondary-focus': '#9c7d5a',
          'secondary-content': '#ffffff',
          'accent': '#7a9c9c',
          'accent-focus': '#5f8282',
          'accent-content': '#ffffff',
          'neutral': '#4a4a4a',
          'neutral-focus': '#333333',
          'neutral-content': '#faf8f5',
          'base-100': '#faf8f5',
          'base-200': '#f2efe9',
          'base-300': '#e6e2d8',
          'base-content': '#2b2b2b',
          'info': '#6b8c9c',
          'success': '#5d7a5d',
          'warning': '#b8956e',
          'error': '#9c5d5d',
        },
      },
      {
        dark: {
          'primary': '#7a9c7a',
          'primary-focus': '#5d7a5d',
          'primary-content': '#1a1a1a',
          'secondary': '#c9a97a',
          'secondary-focus': '#b8956e',
          'secondary-content': '#1a1a1a',
          'accent': '#7a9c9c',
          'accent-focus': '#5f8282',
          'accent-content': '#e8e8e8',
          'neutral': '#3a3a3a',
          'neutral-focus': '#252525',
          'neutral-content': '#d7dae0',
          'base-100': '#1a1a18',
          'base-200': '#252522',
          'base-300': '#30302c',
          'base-content': '#e8e6e0',
          'info': '#6b8c9c',
          'success': '#7a9c7a',
          'warning': '#c9a97a',
          'error': '#9c6b6b',
        },
      },
    ],
  },
} satisfies Config & { daisyui: object }

export default config
