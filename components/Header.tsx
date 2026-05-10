'use client'

import { useTheme } from './ThemeProvider'
import { Sun, Moon, Library } from 'lucide-react'

export function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="navbar bg-base-100/80 backdrop-blur-sm shadow-md border-b border-base-300">
      <div className="flex-1">
        <div className="flex items-center gap-2 ml-4">
          <Library className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-display font-bold text-base-content">
            YunoBib
          </h1>
        </div>
      </div>
      <div className="flex-none">
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-circle hover:bg-base-200 transition-colors"
          aria-label="Theme wechseln"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-base-content" />
          ) : (
            <Sun className="w-5 h-5 text-base-content" />
          )}
        </button>
      </div>
    </header>
  )
}
