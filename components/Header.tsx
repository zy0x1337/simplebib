'use client'

import { useTheme } from './ThemeProvider'
import { Sun, Moon } from 'lucide-react'

export function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="navbar bg-base-100 shadow-lg">
      <div className="flex-1">
        <h1 className="text-xl font-bold ml-4">SimpleBib</h1>
      </div>
      <div className="flex-none">
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-circle"
          aria-label="Theme wechseln"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>
      </div>
    </header>
  )
}
