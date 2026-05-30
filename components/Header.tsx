'use client'

import { useState, useRef } from 'react'
import { useTheme } from './ThemeProvider'
import { exportLibrary, importLibrary } from '@/lib/db'
import { Sun, Moon, Download, Upload } from 'lucide-react'

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    try {
      const json = await exportLibrary()
      const blob = new Blob([json], { type: 'application/json' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href  = url
      a.download = `yunobib-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed', err)
    }
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportMsg(null)
    try {
      const text = await file.text()
      const result = await importLibrary(text)
      setImportMsg(`${result.books} Bücher, ${result.series} Reihen importiert`)
      // Trigger UI refresh
      window.location.reload()
    } catch (err: any) {
      setImportMsg(err.message || 'Import fehlgeschlagen')
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

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
          <svg
            width="22" height="22" viewBox="0 0 32 32" fill="none"
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

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          {/* Import */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center justify-center rounded-md transition-colors"
            style={{
              width: '36px', height: '36px',
              color: 'var(--color-text-muted)',
              background: 'none', border: 'none', cursor: 'pointer',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'
              ;(e.currentTarget as HTMLButtonElement).style.background = 'oklch(from var(--color-text) l c h / 0.06)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)'
              ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            }}
            aria-label="Bibliothek importieren"
            title="Importieren"
          >
            <Upload style={{ width: '1rem', height: '1rem' }} />
          </button>
          <input ref={fileInputRef} type="file" accept=".json"
            style={{ display: 'none' }} onChange={handleImportFile} />

          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center justify-center rounded-md transition-colors"
            style={{
              width: '36px', height: '36px',
              color: 'var(--color-text-muted)',
              background: 'none', border: 'none', cursor: 'pointer',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'
              ;(e.currentTarget as HTMLButtonElement).style.background = 'oklch(from var(--color-text) l c h / 0.06)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)'
              ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            }}
            aria-label="Bibliothek exportieren"
            title="Exportieren"
          >
            <Download style={{ width: '1rem', height: '1rem' }} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center rounded-md transition-colors"
            style={{
              width: '36px', height: '36px',
              color: 'var(--color-text-muted)',
              background: 'none', border: 'none', cursor: 'pointer',
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
              ? <Moon style={{ width: '1rem', height: '1rem' }} />
              : <Sun  style={{ width: '1rem', height: '1rem' }} />
            }
          </button>
        </div>
      </div>

      {/* Import feedback toast */}
      {importMsg && (
        <div style={{
          padding: 'var(--space-2) var(--space-4)',
          background: importMsg.includes('fehlgeschlagen')
            ? 'var(--color-error)' : 'var(--color-success)',
          color: 'var(--color-text-inverse)',
          fontSize: 'var(--text-xs)',
          textAlign: 'center',
        }}>
          {importMsg}
        </div>
      )}

      {/* Double border — book spine depth */}
      <div style={{ height: '1px', background: 'var(--color-divider)' }} />
      <div style={{ height: '1px', background: 'var(--color-border)' }} />
    </header>
  )
}
