'use client'

import { useState } from 'react'
import { Search, BookOpen, AlertCircle, X, RefreshCw } from 'lucide-react'

interface BookSearchProps {
  onBookSelect: (book: { title: string; authors: string; coverUrl: string }) => void
}

function parseError(status: number): string {
  if (status === 429) return 'Zu viele Anfragen. Kurz warten und nochmal versuchen.'
  if (status === 503) return 'Google Books ist gerade nicht erreichbar.'
  if (status === 400) return 'Ungültige Suchanfrage.'
  return `Fehler bei der Buchsuche (${status}).`
}

export function BookSearch({ onBookSelect }: BookSearchProps) {
  const [query, setQuery]             = useState('')
  const [isLoading, setIsLoading]     = useState(false)
  const [results, setResults]         = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [lastQuery, setLastQuery]     = useState('')

  const doSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setResults([])
    setShowResults(false)
    setError(null)
    setLastQuery(searchQuery)

    try {
      const clean  = searchQuery.replace(/-/g, '').trim()
      const isISBN = /^\d{10,13}$/.test(clean)
      const q      = isISBN ? `isbn:${clean}` : searchQuery

      const res  = await fetch(`/api/books/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? parseError(res.status))
        return
      }

      if (!data.items?.length) {
        setError('Keine Bücher gefunden. Anderen Suchbegriff versuchen.')
        return
      }

      // ISBN-Einzeltreffer: direkt übernehmen
      if (isISBN && data.items.length === 1) {
        const v = data.items[0].volumeInfo
        onBookSelect({
          title:    v.title ?? '',
          authors:  v.authors?.join(', ') ?? 'Unbekannter Autor',
          coverUrl: v.imageLinks?.thumbnail?.replace('http:', 'https:') ?? '',
        })
        setQuery('')
        return
      }

      setResults(data.items.map((item: any) => {
        const v = item.volumeInfo
        return {
          title:         v.title ?? '',
          authors:       v.authors?.join(', ') ?? 'Unbekannter Autor',
          coverUrl:      v.imageLinks?.thumbnail?.replace('http:', 'https:') ?? '',
          publishedDate: v.publishedDate ?? '',
        }
      }))
      setShowResults(true)
    } catch {
      setError('Keine Verbindung. Internetverbindung prüfen.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); doSearch(query) }
  const handleRetry  = () => doSearch(lastQuery)

  const handleSelect = (book: any) => {
    onBookSelect(book)
    setQuery(''); setResults([]); setShowResults(false); setError(null)
  }

  const handleClear = () => {
    setQuery(''); setResults([]); setShowResults(false); setError(null)
  }

  return (
    <div style={{ marginBottom: 'var(--space-6)' }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{
            position: 'absolute', left: '0.75rem', top: '50%',
            transform: 'translateY(-50%)', width: '1rem', height: '1rem',
            color: 'var(--color-text-faint)', pointerEvents: 'none',
          }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="ISBN, Titel oder Autor…"
            disabled={isLoading}
            className="bib-input"
            style={{ paddingLeft: '2.25rem', paddingRight: query ? '2.25rem' : undefined }}
          />
          {query && (
            <button type="button" onClick={handleClear}
              style={{
                position: 'absolute', right: '0.75rem', top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none',
                color: 'var(--color-text-faint)', cursor: 'pointer',
                padding: 0, display: 'flex',
              }}
              aria-label="Eingabe löschen">
              <X style={{ width: '0.875rem', height: '0.875rem' }} />
            </button>
          )}
        </div>
        <button type="submit" disabled={isLoading || !query.trim()}
          className="btn-bib-primary" style={{ minWidth: '5.5rem' }}>
          {isLoading ? (
            <span style={{
              display: 'inline-block', width: '1rem', height: '1rem',
              border: '2px solid var(--color-text-inverse)',
              borderTopColor: 'transparent', borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} aria-label="Lädt…" />
          ) : 'Suchen'}
        </button>
      </form>

      {error && (
        <div style={{
          marginTop: 'var(--space-3)',
          display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)',
          padding: '0.625rem 0.75rem',
          borderRadius: 'var(--radius-md)',
          background: 'oklch(from var(--color-error) l c h / 0.10)',
          border: '1px solid oklch(from var(--color-error) l c h / 0.18)',
        }}>
          <AlertCircle style={{
            width: '1rem', height: '1rem',
            color: 'var(--color-error)', marginTop: '0.125rem',
            flexShrink: 0,
          }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'oklch(from var(--color-error) l c h / 0.85)', lineHeight: 'var(--leading-snug)' }}>
              {error}
            </p>
            {lastQuery && (
              <button type="button" onClick={handleRetry} disabled={isLoading}
                style={{
                  marginTop: 'var(--space-1)',
                  display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
                  fontSize: 'var(--text-xs)',
                  color: 'oklch(from var(--color-error) l c h / 0.65)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: 0,
                }}>
                <RefreshCw style={{ width: '0.75rem', height: '0.75rem' }} />
                Nochmal versuchen
              </button>
            )}
          </div>
        </div>
      )}

      {showResults && results.length > 0 && (
        <div style={{
          marginTop: 'var(--space-2)',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
          maxHeight: '420px',
          overflowY: 'auto',
        }} className="anim-fade-in">
          {/* Results header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.625rem var(--space-4)',
            borderBottom: '1px solid var(--color-divider)',
          }}>
            <span className="label-caps">{results.length} Ergebnisse</span>
            <button onClick={handleClear}
              style={{
                background: 'none', border: 'none',
                fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)',
                cursor: 'pointer',
              }}>
              Schließen
            </button>
          </div>
          {/* Results list */}
          {results.map((book, i) => (
            <button key={i} onClick={() => handleSelect(book)}
              style={{
                width: '100%', display: 'flex', gap: 'var(--space-3)',
                padding: '0.75rem var(--space-4)', textAlign: 'left',
                background: 'none', border: 'none',
                borderBottom: i < results.length - 1 ? '1px solid var(--color-divider)' : 'none',
                cursor: 'pointer',
                transition: 'background var(--transition)',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-accent)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
            >
              <div style={{
                flexShrink: 0, width: '2.25rem', height: '3.375rem',
                borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                background: 'var(--color-surface-2)',
              }}>
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy" />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <BookOpen style={{ width: '0.875rem', height: '0.875rem', color: 'var(--color-text-faint)' }} />
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.125rem' }}>
                <p className="card-title-serif" style={{
                  fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-snug)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  color: 'var(--color-text)',
                }}>
                  {book.title}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {book.authors}
                  {book.publishedDate && (
                    <span style={{ color: 'var(--color-text-faint)' }}>
                      {' · '}{book.publishedDate.slice(0, 4)}
                    </span>
                  )}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
