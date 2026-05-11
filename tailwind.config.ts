import type { Config } from 'tailwindcss'

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
        body:    ['var(--font-body)', 'Helvetica Neue', 'sans-serif'],
      },
      colors: {
        bg:               'var(--color-bg)',
        surface:          'var(--color-surface)',
        'surface-2':      'var(--color-surface-2)',
        'surface-elevated':'var(--color-surface-elevated)',
        'surface-accent': 'var(--color-surface-accent)',
        border:           'var(--color-border)',
        divider:          'var(--color-divider)',
        text:             'var(--color-text)',
        muted:            'var(--color-text-muted)',
        faint:            'var(--color-text-faint)',
        inverse:          'var(--color-text-inverse)',
        accent:           'var(--color-accent)',
        'accent-hover':   'var(--color-accent-hover)',
        'accent-muted':   'var(--color-accent-muted)',
        star:             'var(--color-star)',
        reading:          'var(--color-reading)',
        'reading-muted':  'var(--color-reading-muted)',
        finished:         'var(--color-finished)',
        unread:           'var(--color-unread)',
        error:            'var(--color-error)',
        success:          'var(--color-success)',
      },
      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm:   'var(--shadow-sm)',
        md:   'var(--shadow-md)',
        lg:   'var(--shadow-lg)',
        book: 'var(--shadow-book)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'fade-up':    'fadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in':    'fadeIn 0.28s ease-out both',
        'scale-in':   'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'modal-in':   'modalIn 0.36s cubic-bezier(0.16, 1, 0.3, 1) both',
        'sheet-up':   'sheetUp 0.30s cubic-bezier(0.22, 1, 0.36, 1) both',
        'shimmer':    'shimmer 1.6s ease-in-out infinite',
        'tab-pop':    'tabPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'star-fill':  'starFill 120ms ease both',
        'star-burst': 'starBurst 250ms cubic-bezier(0.16, 1, 0.3, 1) both',
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
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.93)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        modalIn: {
          '0%':   { opacity: '0', transform: 'perspective(1000px) rotateX(-2deg) translateY(20px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'perspective(1000px) rotateX(0deg) translateY(0) scale(1)' },
        },
        sheetUp: {
          '0%':   { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        tabPop: {
          '0%':   { transform: 'scaleX(0)' },
          '60%':  { transform: 'scaleX(1.15)' },
          '100%': { transform: 'scaleX(1)' },
        },
        starFill: {
          '0%':   { color: 'var(--color-text-faint)', transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.15)' },
          '100%': { color: 'var(--color-star)', transform: 'scale(1)' },
        },
        starBurst: {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.35)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  // No plugins — DaisyUI removed
} satisfies Config

export default config
