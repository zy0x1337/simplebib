'use client'

import { useTheme } from './ThemeProvider'
import { Sun, Moon } from 'lucide-react'

export function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 bg-base-100/85 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 sm:px-5 h-13">

        {/* Logo + Titel */}
        <div className="flex items-center gap-2">
          {/* Buchzeichen-Ornament */}
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <rect x="3" y="2" width="13" height="18" rx="1.5"
              stroke="currentColor" strokeWidth="1.4"
              className="text-primary"
            />
            <line x1="3" y1="7" x2="16" y2="7"
              stroke="currentColor" strokeWidth="1.1"
              className="text-primary" strokeDasharray="1.5 2"
            />
            <path d="M16 5 L19 5 L19 17 L16 14"
              stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"
              className="text-secondary"
            />
          </svg>
          <span className="app-title text-lg sm:text-xl tracking-tight">
            YunoBib
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-md
                     text-base-content/45 hover:text-base-content
                     hover:bg-base-content/6 active:bg-base-content/10
                     transition-colors duration-150"
          aria-label={theme === 'light' ? 'Dark Mode aktivieren' : 'Light Mode aktivieren'}
        >
          {theme === 'light'
            ? <Moon className="w-4 h-4" />
            : <Sun  className="w-4 h-4" />
          }
        </button>
      </div>

      {/*
        Doppelte Trennlinie für Tiefe — erste sehr zart, zweite etwas stärker.
        Wirkt wie ein Bucheinband-Rand.
      */}
      <div className="h-px bg-base-content/5" />
      <div className="h-px bg-base-content/10" />
    </header>
  )
}
