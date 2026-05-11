'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { db, initializeSettings } from '@/lib/db'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{
  theme: Theme
  toggleTheme: () => void
}>({
  theme: 'dark',
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const loadTheme = async () => {
      // Apply system preference immediately before DB loads
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const initial: Theme = systemDark ? 'dark' : 'light'

      await initializeSettings()
      const settings = await db.settings.toArray()
      const saved = settings[0]?.theme as Theme | undefined
      const resolved = saved ?? initial

      setTheme(resolved)
      document.documentElement.setAttribute('data-theme', resolved)
      setMounted(true)
    }
    loadTheme()
  }, [])

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme, mounted])

  const toggleTheme = async () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    const settings = await db.settings.toArray()
    if (settings[0]) {
      await db.settings.update(settings[0].id!, { theme: newTheme })
    }
  }

  // Prevent FOUC — render children immediately, theme attr applied above
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
