// 🎯 PWA-Pattern: App Header mit Theme Toggle
// ✅ TypeScript Strict Mode
// ⚡ Minimal Component

'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="navbar bg-base-100 shadow-md sticky top-0 z-50">
      <div className="flex-1">
        <h1 className="text-xl font-bold px-4">📚 SimpleBib</h1>
      </div>
      
      <div className="flex-none">
        <button
          className="btn btn-ghost btn-circle"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
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
