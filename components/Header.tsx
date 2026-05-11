'use client'

import { useTheme } from './ThemeProvider'
import { Sun, Moon } from 'lucide-react'

export function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'oklch(from var(--color-bg) l c h / 0.88)',
        backdropFilter: 'blur(20px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
      }}
    >
      <div className="flex items-center justify-between px-4 sm:px-5"
           style={{ height: 'var(--header-height-mobile)' }}>

        {/* Logo + Title */}
        <div className="flex items-center gap-2">
          {/* Y-shaped book pages — custom SVG logo */}
          <svg
            width="22" height="22" viewBox="0 0 32 32" fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style={{ color: 'var(--color-accent)' }}
          >
            <path
              d="M7 5 L16 15 L25 5"
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            />
            <line
              x1="16" y1="15" x2="16" y2="27"
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M11 27 L21 27"
              stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.35"
            />
          </svg>
          <span className="app-title">
            YunoBib
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center rounded-md transition-colors"
          style={{
            width: '36px', height: '36px',
            color: 'var(--color-text-muted)',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'
            ;(e.currentTarget as HTMLButtonElement).style.background = 'oklch(from var(--color-text) l c h / 0.06)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)'
            ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
          }}
          aria-label={theme === 'light' ? 'Dark Mode aktivieren' : 'Light Mode aktivieren'}
        >
          {theme === 'light'
            ? <Moon className="w-4 h-4" />
            : <Sun  className="w-4 h-4" />
          }
        </button>
      </div>

      {/* Double border — depth effect like a book spine edge */}
      <div style={{ height: '1px', background: 'var(--color-divider)' }} />
      <div style={{ height: '1px', background: 'var(--color-border)' }} />
    </header>
  )
}
