'use client'

import { useState } from 'react'
import { Search, BookOpen, AlertCircle, X } from 'lucide-react'

interface BookSearchProps {
  onBookSelect: (book: { title: string; authors: string; coverUrl: string }) => void
}

async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    const res = await fetch(url)
    if (res.status === 503 || res.status === 429) {
      if (i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000))
        continue
      }
    }
    return res
  }
  return fetch(url)
}

export function BookSearch({ onBookSelect }: BookSearchProps) {
  const [query, setQuery]               = useState('')
  const [isLoading, setIsLoading]       = useState(false)
  const [results, setResults]           = useState<any[]>([])
  const [showResults, setShowResults]   = useState(false)
  const [error, setError]               = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setResults([])
    setShowResults(false)
    setError(null)

    try {
      const clean  = query.replace(/-/g, '').trim()
      const isISBN = /^\d{10,13}$/.test(clean)
      const url    = isISBN
        ? `https://www.googleapis.com/books/v1/volumes?q=isbn:${clean}`
        : `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=15`

      const res = await fetchWithRetry(url)

      if (!res.ok) {
        if (res.status === 503) throw new Error('Google Books ist vorübergehend nicht verfügbar.')
        if (res.status === 429) throw new Error('Zu viele Anfragen — bitte kurz warten.')
        throw new Error(`Fehler ${res.status}`)
      }

      const data = await res.json()

      if (!data.items?.length) {
        setError('Keine Bücher gefunden. Anderen Suchbegriff versuchen.')
        return
      }

      if (isISBN && data.items.length === 1) {
        const v = data.items[0].volumeInfo
        onBookSelect({
          title:    v.title,
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
          description:   v.description ?? '',
        }
      }))
      setShowResults(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (book: any) => {
    onBookSelect(book)
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
    setError(null)
  }

  return (
    <div className="mb-6">

      {/* Suchzeile */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4
                       text-base-content/35 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="ISBN, Titel oder Autor…"
            disabled={isLoading}
            className="bib-input pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2
                         text-base-content/30 hover:text-base-content/70
                         transition-colors"
              aria-label="Eingabe löschen"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="btn-bib-primary min-w-[5.5rem]"
        >
          {isLoading ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            'Suchen'
          )}
        </button>
      </form>

      {/* Fehlermeldung */}
      {error && (
        <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-lg
                        bg-error/8 border border-error/20">
          <AlertCircle className="w-4 h-4 text-error mt-0.5 flex-shrink-0" />
          <p className="text-sm text-error/90">{error}</p>
        </div>
      )}

      {/* Ergebnis-Liste */}
      {showResults && results.length > 0 && (
        <div
          className="mt-2 bg-base-100 rounded-lg overflow-hidden
                     border border-base-content/8
                     shadow-lg max-h-[420px] overflow-y-auto
                     anim-fade-in"
        >
          <div className="px-4 py-2.5 border-b border-base-content/8 flex items-center justify-between">
            <span className="label-caps">{results.length} Ergebnisse</span>
            <button
              onClick={handleClear}
              className="text-base-content/35 hover:text-base-content/70
                         transition-colors text-xs"
            >
              Schließen
            </button>
          </div>

          {results.map((book, i) => (
            <button
              key={i}
              onClick={() => handleSelect(book)}
              className="w-full flex gap-3 px-4 py-3 text-left
                         hover:bg-base-content/4
                         border-b border-base-content/5 last:border-0
                         transition-colors duration-150 group"
            >
              {/* Mini-Cover */}
              <div className="flex-shrink-0 w-9 h-[3.375rem] rounded overflow-hidden bg-base-300">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-3.5 h-3.5 text-base-content/25" />
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                <p className="card-title-serif text-sm leading-snug line-clamp-1
                              group-hover:text-primary transition-colors">
                  {book.title}
                </p>
                <p className="text-xs text-base-content/50 truncate">
                  {book.authors}
                  {book.publishedDate && (
                    <span className="text-base-content/35"> · {book.publishedDate.slice(0, 4)}</span>
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
