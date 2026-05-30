'use client'

import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Book, db, sortBooks, searchBooks, type SortKey, type SortDir } from '@/lib/db'
import { BookCard } from '@/components/BookCard'
import { BentoBooksGrid } from '@/components/BentoBooksGrid'
import { Search, X, Library, Grid3X3, List, ArrowUpDown } from 'lucide-react'

interface BooksTabProps {
  onAddBook: () => void
}

export function BooksTab({ onAddBook }: BooksTabProps) {
  const allBooks = useLiveQuery(() => db.books.toArray(), [])
  const settings = useLiveQuery(() => db.settings.toArray(), [])

  const [searchQuery, setSearchQuery] = useState('')
  const sortKey = (settings?.[0]?.sortBy ?? 'dateAdded') as SortKey
  const sortDir = (settings?.[0]?.sortOrder ?? 'desc') as SortDir
  const viewMode = (settings?.[0]?.defaultView ?? 'grid') as 'grid' | 'list'

  const standaloneBooks = useMemo(() => {
    if (!allBooks) return []
    const filtered = allBooks.filter(b => !b.seriesId)
    const searched = searchQuery.trim() ? searchBooks(filtered, searchQuery) : filtered
    return sortBooks(searched, sortKey, sortDir)
  }, [allBooks, searchQuery, sortKey, sortDir])

  const updateSettings = async (patch: object) => {
    const s = await db.settings.toArray()
    if (s[0]) await db.settings.update(s[0].id!, patch)
  }

  const cycleSort = async () => {
    const order: [SortKey, SortDir][] = [
      ['dateAdded', 'desc'], ['title', 'asc'], ['author', 'asc'], ['rating', 'desc'],
    ]
    const idx = order.findIndex(([k, d]) => k === sortKey && d === sortDir)
    const next = order[(idx + 1) % order.length]
    await updateSettings({ sortBy: next[0], sortOrder: next[1] })
  }

  const sortLabel: Record<string, string> = {
    'dateAdded:desc': 'Neueste',
    'title:asc': 'A–Z',
    'author:asc': 'Autor',
    'rating:desc': 'Beste',
  }

  if (!allBooks) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12) 0' }}>
        <div style={{
          width: '2rem', height: '2rem', borderRadius: '50%',
          border: '2px solid var(--color-border)',
          borderTopColor: 'var(--color-accent)',
          animation: 'spin 0.75s linear infinite',
        }} />
      </div>
    )
  }

  if (standaloneBooks.length === 0 && !searchQuery) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 'var(--space-3)', padding: 'var(--space-12) 0', textAlign: 'center',
      }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true" style={{ color: 'var(--color-text-faint)' }}>
          <rect x="6" y="5" width="22" height="30" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <line x1="6" y1="12" x2="28" y2="12" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
          <line x1="10" y1="18" x2="24" y2="18" stroke="currentColor" strokeWidth="1" />
          <line x1="10" y1="22" x2="20" y2="22" stroke="currentColor" strokeWidth="1" />
        </svg>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'var(--text-base)', color: 'var(--color-text-faint)' }}>
          Noch keine Einzelbücher
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
          Alle Bücher sind in Reihen — oder füge jetzt eines hinzu.
        </p>
      </div>
    )
  }

  return (
    <div className="anim-fade-in" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 8px))' }}>
      {/* Toolbar: search + sort + view toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
        marginBottom: 'var(--space-3)',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{
            position: 'absolute', left: '0.625rem', top: '50%',
            transform: 'translateY(-50%)', width: '0.875rem', height: '0.875rem',
            color: 'var(--color-text-faint)', pointerEvents: 'none',
          }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Bibliothek durchsuchen…"
            className="bib-input"
            style={{ paddingLeft: '1.75rem', paddingRight: searchQuery ? '2rem' : undefined, fontSize: 'var(--text-sm)' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute', right: '0.625rem', top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none', padding: 0,
                color: 'var(--color-text-faint)', cursor: 'pointer',
              }}>
              <X style={{ width: '0.75rem', height: '0.75rem' }} />
            </button>
          )}
        </div>
        {/* Sort */}
        <button onClick={cycleSort}
          className="btn-bib-ghost"
          style={{ padding: '0.5rem 0.625rem', fontSize: 'var(--text-xs)', gap: 'var(--space-1)' }}
          title="Sortierung ändern"
        >
          <ArrowUpDown style={{ width: '0.75rem', height: '0.75rem' }} />
          <span className="hidden sm:inline">{sortLabel[`${sortKey}:${sortDir}`] ?? 'Sort'}</span>
        </button>
        {/* View toggle */}
        <button
          onClick={async () => {
            await updateSettings({ defaultView: viewMode === 'grid' ? 'list' : 'grid' })
          }}
          className="btn-bib-ghost"
          style={{ padding: '0.5rem', fontSize: 'var(--text-xs)' }}
          title={viewMode === 'grid' ? 'Listenansicht' : 'Rasteransicht'}
        >
          {viewMode === 'grid'
            ? <List style={{ width: '1rem', height: '1rem' }} />
            : <Grid3X3 style={{ width: '1rem', height: '1rem' }} />
          }
        </button>
      </div>

      {/* Search results info */}
      {searchQuery && (
        <p style={{
          fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)',
          marginBottom: 'var(--space-3)',
        }}>
          {standaloneBooks.length} {standaloneBooks.length === 1 ? 'Treffer' : 'Treffer'} für »{searchQuery}«
        </p>
      )}

      {/* Book grid/list */}
      {standaloneBooks.length > 0 ? (
        viewMode === 'list' ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {standaloneBooks.map((book, i) => (
              <div key={book.id} className="anim-fade-up" style={{ animationDelay: `${Math.min(i * 0.03, 0.3)}s` }}>
                <BookCard book={book} viewMode="list" />
              </div>
            ))}
          </div>
        ) : (
          <BentoBooksGrid books={standaloneBooks} />
        )
      ) : searchQuery ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 'var(--space-3)', padding: 'var(--space-8) 0', textAlign: 'center',
        }}>
          <Search style={{ width: '2rem', height: '2rem', color: 'var(--color-text-faint)' }} />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            Keine Treffer für »{searchQuery}«
          </p>
        </div>
      ) : null}
    </div>
  )
}
