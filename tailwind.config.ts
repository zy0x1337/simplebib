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
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'Georgia', 'serif'],
      },
      colors: {
        parchment: '#f0ebe0',
        ink:       '#1c1917',
        moss:      '#3d5a3e',
        amber:     '#c47c2b',
        rust:      '#8b3a2a',
        mist:      '#8a9a8b',
      },
      animation: {
        'fade-up':    'fadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in':    'fadeIn 0.3s ease-out forwards',
        'modal-in':   'modalIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer':    'shimmer 1.6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        modalIn: {
          '0%':   { opacity: '0', transform: 'translateY(20px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        light: {
          'primary':          '#3d5a3e',
          'primary-focus':    '#2e4430',
          'primary-content':  '#f0ebe0',
          'secondary':        '#c47c2b',
          'secondary-focus':  '#a86520',
          'secondary-content':'#ffffff',
          'accent':           '#8b3a2a',
          'accent-focus':     '#6e2c1f',
          'accent-content':   '#ffffff',
          'neutral':          '#3a3530',
          'neutral-focus':    '#28241f',
          'neutral-content':  '#f0ebe0',
          'base-100':         '#f7f3ea',
          'base-200':         '#ede7d9',
          'base-300':         '#e0d8c8',
          'base-content':     '#1c1917',
          'info':             '#5c7fa0',
          'success':          '#3d5a3e',
          'warning':          '#c47c2b',
          'error':            '#8b3a2a',
          '--rounded-box':    '0.5rem',
          '--rounded-btn':    '0.375rem',
          '--rounded-badge':  '0.25rem',
          '--font-display':   'Playfair Display',
          '--font-body':      'Lora',
        },
      },
      {
        dark: {
          'primary':          '#7aab7b',
          'primary-focus':    '#5d8f5e',
          'primary-content':  '#0f1a10',
          'secondary':        '#d4954a',
          'secondary-focus':  '#bb7a35',
          'secondary-content':'#1a0f00',
          'accent':           '#c47060',
          'accent-focus':     '#a85748',
          'accent-content':   '#1a0800',
          'neutral':          '#2a2520',
          'neutral-focus':    '#1e1a16',
          'neutral-content':  '#d8d0c4',
          'base-100':         '#181410',
          'base-200':         '#211c18',
          'base-300':         '#2a2520',
          'base-content':     '#d8d0c4',
          'info':             '#7a9cbc',
          'success':          '#7aab7b',
          'warning':          '#d4954a',
          'error':            '#c47060',
          '--rounded-box':    '0.5rem',
          '--rounded-btn':    '0.375rem',
          '--rounded-badge':  '0.25rem',
          '--font-display':   'Playfair Display',
          '--font-body':      'Lora',
        },
      },
    ],
  },
} satisfies Config & { daisyui: object }

export default config
