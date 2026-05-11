'use client'

import { useTheme } from './ThemeProvider'
import { Sun, Moon } from 'lucide-react'

export function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 bg-base-100/90 backdrop-blur-md">
      {/* Hauptzeile */}
      <div className="flex items-center justify-between px-5 h-14">

        {/* Logo + Titel */}
        <div className="flex items-center gap-2.5">
          {/* Buchzeichen-Ornament als inline SVG */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            aria-hidden="true"
          >
            <rect x="3" y="2" width="13" height="18" rx="1.5"
              stroke="currentColor" strokeWidth="1.4"
              className="text-primary"
            />
            <line x1="3" y1="7" x2="16" y2="7"
              stroke="currentColor" strokeWidth="1.1"
              className="text-primary" strokeDasharray="1.5 2"
            />
            <path d="M16 5 L19 5 L19 17 L16 14" stroke="currentColor"
              strokeWidth="1.2" strokeLinejoin="round"
              className="text-secondary"
            />
          </svg>

          <span className="app-title text-xl tracking-tight">
            YunoBib
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-md
                     text-base-content/50 hover:text-base-content
                     hover:bg-base-content/6
                     transition-colors duration-200"
          aria-label="Theme wechseln"
        >
          {theme === 'light' ? (
            <Moon className="w-4.5 h-4.5" />
          ) : (
            <Sun className="w-4.5 h-4.5" />
          )}
        </button>
      </div>

      {/* Trennlinie — zwei Pixel, zweifarbig für Tiefe */}
      <div className="h-px bg-base-content/8" />
      <div className="h-px bg-base-content/4" />
    </header>
  )
}
