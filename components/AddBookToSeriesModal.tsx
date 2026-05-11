'use client'

import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Series, Book, updateSeriesRating } from '@/lib/db'
import { X, Search } from 'lucide-react'

interface AddBookToSeriesModalProps {
  series: Series
  isOpen: boolean
  onClose: () => void
}

export function AddBookToSeriesModal({ series, isOpen, onClose }: AddBookToSeriesModalProps) {
  const [searchQuery, setSearchQuery]     = useState('')
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [position, setPosition]           = useState<number>(1)
  const [isLoading, setIsLoading]         = useState(false)
  const [error, setError]                 = useState<string | null>(null)

  // Books not assigned to any other series (or already in this one)
  const availableBooks = useLiveQuery(
    () => db.books.toArray().then(books =>
      books.filter(book => !book.seriesId || book.seriesId === series.id)
    ),
    [series.id]
  )

  // Next position in series
  const nextPosition = useLiveQuery(
    async () => {
      const booksInSeries = await db.books.where('seriesId').equals(series.id!).toArray()
      const positions = booksInSeries.map(b => b.seriesPosition || 0)
      return positions.length > 0 ? Math.max(...positions) + 1 : 1
    },
    [series.id]
  )

  useEffect(() => {
    if (isOpen) {
      setSelectedBookId(null)
      setSearchQuery('')
      setPosition(nextPosition || 1)
      setError(null)
    }
  }, [isOpen, nextPosition])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const filteredBooks = availableBooks?.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (book: Book) => {
    setSelectedBookId(book.id!)
    setError(null)
    if (book.seriesId === series.id && book.seriesPosition) {
      setPosition(book.seriesPosition)
    } else {
      setPosition(nextPosition || 1)
    }
  }

  const handleSubmit = async () => {
    if (!selectedBookId) { setError('Bitte wähle ein Buch aus'); return }
    setIsLoading(true)
    setError(null)
    try {
      await db.books.update(selectedBookId, {
        seriesId: series.id,
        seriesPosition: position,
      })
      await updateSeriesRating(series.id!)
      setSelectedBookId(null)
      setSearchQuery('')
      onClose()
    } catch {
      setError('Fehler beim Hinzufügen')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-xs)',
    fontWeight: 600,
    letterSpacing: 'var(--tracking-widest)',
    textTransform: 'uppercase' as const,
    color: 'var(--color-text-muted)',
  }

  return (
    <div className="modal-overlay anim-fade-in" onClick={onClose}>
      <div
        className="modal-box anim-modal-in"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-to-series-title"
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden" style={{ display: 'flex', justifyContent: 'center', paddingBottom: 'var(--space-2)' }}>
          <div style={{
            width: '2.5rem', height: '0.25rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-border)',
          }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingBottom: 'var(--space-3)', marginBottom: 'var(--space-1)',
        }}>
          <div>
            <h2
              id="add-to-series-title"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-xl)',
                fontWeight: 400,
                fontStyle: 'italic',
                letterSpacing: 'var(--tracking-tight)',
                color: 'var(--color-text)',
                lineHeight: 'var(--leading-tight)',
              }}
            >
              Buch hinzufügen
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              marginTop: 'var(--space-1)',
              letterSpacing: 'var(--tracking-wide)',
            }}>
              {series.name}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn btn-icon btn-ghost"
            aria-label="Schließen"
          >
            <X style={{ width: '1rem', height: '1rem' }} />
          </button>
        </div>

        <div style={{ height: '1px', background: 'var(--color-divider)', marginBottom: 'var(--space-4)' }} />

        {/* Inline error */}
        {error && (
          <div
            className="anim-fade-in"
            style={{
              marginBottom: 'var(--space-3)',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              background: 'oklch(from var(--color-error) l c h / 0.12)',
              color: 'var(--color-error)',
              fontSize: 'var(--text-sm)',
            }}
          >
            {error}
          </div>
        )}

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 'var(--space-3)' }}>
          <Search style={{
            position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
            width: '0.875rem', height: '0.875rem',
            color: 'var(--color-text-faint)',
            pointerEvents: 'none',
          }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Buch suchen…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Book list */}
        <div style={{
          maxHeight: '14rem',
          overflowY: 'auto',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-4)',
          background: 'var(--color-surface)',
        }}>
          {!filteredBooks || filteredBooks.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-8)',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-body)',
            }}>
              {searchQuery ? 'Keine passenden Bücher gefunden' : 'Alle Bücher bereits in einer Reihe'}
            </div>
          ) : (
            <div>
              {filteredBooks.map((book, idx) => {
                const isSelected = selectedBookId === book.id
                const alreadyIn  = book.seriesId === series.id
                return (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => handleSelect(book)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      width: '100%',
                      padding: 'var(--space-3)',
                      background: isSelected ? 'var(--color-surface-accent)' : 'transparent',
                      border: 'none',
                      borderTop: idx > 0 ? '1px solid var(--color-divider)' : 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background var(--transition)',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected)
                        (e.currentTarget as HTMLButtonElement).style.background = 'oklch(from var(--color-text) l c h / 0.04)'
                    }}
                    onMouseLeave={e => {
                      if (!isSelected)
                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                    }}
                  >
                    {/* Cover thumbnail */}
                    <div style={{
                      width: '2.5rem',
                      aspectRatio: '2/3',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: 'var(--color-surface-2)',
                    }}>
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          loading="lazy"
                        />
                      ) : (
                        <div style={{
                          width: '100%', height: '100%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'var(--color-surface-2)',
                        }}>
                          <span style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-text-faint)',
                            fontStyle: 'italic',
                          }}>
                            {book.title.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 400,
                        fontStyle: 'italic',
                        color: 'var(--color-text)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 'var(--leading-snug)',
                      }}>
                        {book.title}
                      </p>
                      <p style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-muted)',
                        letterSpacing: 'var(--tracking-wide)',
                        marginTop: '0.1rem',
                      }}>
                        {book.author}
                      </p>
                      {alreadyIn && (
                        <span style={{
                          display: 'inline-block',
                          marginTop: 'var(--space-1)',
                          padding: '0.1rem 0.4rem',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--color-accent-muted)',
                          color: 'var(--color-accent)',
                          fontSize: 'var(--text-xs)',
                          fontFamily: 'var(--font-body)',
                          fontWeight: 500,
                        }}>
                          Band {book.seriesPosition}
                        </span>
                      )}
                    </div>

                    {/* Selection indicator */}
                    <div style={{
                      width: '1.125rem', height: '1.125rem',
                      borderRadius: 'var(--radius-full)',
                      border: `2px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      background: isSelected ? 'var(--color-accent)' : 'transparent',
                      flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all var(--transition)',
                    }}>
                      {isSelected && (
                        <svg viewBox="0 0 8 6" style={{ width: '0.5rem', fill: 'none', stroke: 'var(--color-bg)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                          <polyline points="1,3 3,5 7,1" />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Position input — only when a book is selected */}
        {selectedBookId && (
          <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', marginBottom: 'var(--space-4)' }}>
            <label style={labelStyle}>Band-Nummer</label>
            <input
              type="number"
              className="input"
              style={{ width: '8rem' }}
              value={position}
              onChange={e => setPosition(parseInt(e.target.value) || 1)}
              min="1"
            />
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="btn btn-ghost"
            style={{ flex: 1 }}
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !selectedBookId}
            className="btn btn-primary"
            style={{
              flex: 1,
              opacity: !selectedBookId ? 0.4 : 1,
              cursor: !selectedBookId ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? (
              <span
                style={{
                  display: 'inline-block',
                  width: '1rem', height: '1rem',
                  border: '2px solid var(--color-text-inverse)',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }}
                aria-label="Lädt…"
              />
            ) : 'Hinzufügen'}
          </button>
        </div>
      </div>
    </div>
  )
}
