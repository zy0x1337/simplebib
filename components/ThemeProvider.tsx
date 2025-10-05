// 🎯 PWA-Pattern: Client-Side Theme Management
// ✅ TypeScript Strict Mode
// ⚡ Performance-Critical: LocalStorage Cache
// 📱 App-like UX: Seamless Theme Switching

'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { db, initializeSettings } from '@/lib/db'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{
  theme: Theme
  toggleTheme: () => void
}>({
  theme: 'light',
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  // Load Theme from IndexedDB
  useEffect(() => {
    const loadTheme = async () => {
      await initializeSettings()
      const settings = await db.settings.toArray()
      if (settings[0]) {
        setTheme(settings[0].theme)
      }
      setMounted(true)
    }
    loadTheme()
  }, [])

  // Apply Theme
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme, mounted])

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    
    // Save to IndexedDB
    const settings = await db.settings.toArray()
    if (settings[0]) {
      await db.settings.update(settings[0].id!, { theme: newTheme })
    }
  }

  // Prevent Flash of Unstyled Content
  if (!mounted) {
    return <div className="bg-base-100 min-h-screen">{children}</div>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
