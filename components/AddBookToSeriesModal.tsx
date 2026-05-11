'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Series, Book, updateSeriesRating } from '@/lib/db'
import { X, Search, BookOpen, Check } from 'lucide-react'

interface AddBookToSeriesModalProps {
  series: Series
  isOpen: boolean
  onClose: () => void
}

/** Renders a book cover — supports both blob and URL covers */
function BookCover({ book }: { book: Book }) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    if (book.coverType === 'upload' && book.coverBlob) {
      const url = URL.createObjectURL(book.coverBlob)
      setSrc(url)
      return () => URL.revokeObjectURL(url)
    } else if (book.coverType === 'url' && book.coverUrl) {
      setSrc(book.coverUrl)
    } else {
      setSrc(null)
    }
  }, [book.coverBlob, book.coverUrl, book.coverType])

  return (
    <div style={{
      width: '2.25rem',
      aspectRatio: '2/3',
      borderRadius: 'var(--radius-sm)',
      overflow: 'hidden',
      flexShrink: 0,
      background: 'var(--color-surface-2)',
      border: '1px solid var(--color-border)',
    }}>
      {src ? (
        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <BookOpen style={{ width: '0.75rem', height: '0.75rem', color: 'var(--color-text-faint)' }} />
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <span style={{
      display: 'inline-block',
      width: '0.875rem', height: '0.875rem',
      borderRadius: '50%',
      border: '2px solid oklch(from var(--color-text-inverse) l c h / 0.3)',
      borderTopColor: 'var(--color-text-inverse)',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }} aria-hidden="true" />
  )
}

export function AddBookToSeriesModal({ series, isOpen, onClose }: AddBookToSeriesModalProps) {
  const [searchQuery, setSearchQuery]       = useState('')
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [position, setPosition]             = useState<number>(1)
  const [isLoading, setIsLoading]           = useState(false)
  const [error, setError]                   = useState<string | null>(null)
  const [mounted, setMounted]               = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const availableBooks = useLiveQuery(
    () => db.books.toArray().then(books =>
      books.filter(book => !book.seriesId || book.seriesId === series.id)
    ),
    [series.id]
  )

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
    if (!selectedBookId) { setError('Bitte w\u00e4hle ein Buch aus'); return }
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
      setError('Fehler beim Hinzuf\u00fcgen')
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  const modal = isOpen ? (
    <div className="modal-overlay anim-fade-in" onClick={onClose}>
      <div
        className="modal-box anim-modal-in"
        style={{ maxWidth: '480px' }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-to-series-title"
      >
        {/* Handle */}
        <div className="modal-box__handle">
          <div className="modal-box__handle-bar" />
        </div>

        {/* HEADER */}
        <div className="modal-box__header">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
            <div style={{ minWidth: 0 }}>
              <h2 id="add-to-series-title" style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-base)',
                fontWeight: 400,
                fontStyle: 'italic',
                letterSpacing: 'var(--tracking-tight)',
                color: 'var(--color-text)',
                lineHeight: 'var(--leading-snug)',
              }}>
                Buch hinzuf\u00fcgen
              </h2>
              <p style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                letterSpacing: 'var(--tracking-widest)',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                marginTop: '0.15rem',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {series.name}
              </p>
            </div>
            <button onClick={onClose} disabled={isLoading}
              className="btn btn-icon btn-ghost" aria-label="Schlie\u00dfen" style={{ flexShrink: 0 }}>
              <X style={{ width: '1rem', height: '1rem' }} />
            </button>
          </div>
        </div>

        <div className="modal-box__divider" />

        {/* BODY */}
        <div className="modal-box__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>

          {/* Error banner */}
          {error && (
            <div className="anim-fade-in" style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              background: 'oklch(from var(--color-error) l c h / 0.12)',
              color: 'var(--color-error)',
              fontSize: 'var(--text-sm)',
            }}>
              {error}
            </div>
          )}

          {/* Search */}
          <div style={{ position: 'relative' }}>
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
              placeholder="Buch suchen\u2026"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* Book list */}
          <div style={{
            flex: '1 1 0',
            minHeight: '8rem',
            maxHeight: '16rem',
            overflowY: 'auto',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--color-surface)',
            overscrollBehavior: 'contain',
          }}>
            {!filteredBooks || filteredBooks.length === 0 ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 'var(--space-2)', padding: 'var(--space-8)',
                color: 'var(--color-text-faint)',
              }}>
                <BookOpen style={{ width: '1.5rem', height: '1.5rem' }} />
                <p style={{ fontSize: 'var(--text-sm)', textAlign: 'center' }}>
                  {searchQuery ? 'Keine passenden B\u00fccher' : 'Alle B\u00fccher bereits in einer Reihe'}
                </p>
              </div>
            ) : (
              filteredBooks.map((book, idx) => {
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
                        (e.currentTarget as HTMLButtonElement).style.background = isSelected ? 'var(--color-surface-accent)' : 'transparent'
                    }}
                  >
                    <BookCover book={book} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'var(--text-sm)',
                        fontStyle: 'italic',
                        color: 'var(--color-text)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 'var(--leading-snug)',
                      }}>{book.title}</p>
                      <p style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-muted)',
                        letterSpacing: 'var(--tracking-wide)',
                        marginTop: '0.1rem',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{book.author}</p>
                      {alreadyIn && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                          marginTop: 'var(--space-1)',
                          padding: '0.1rem 0.4rem',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--color-accent-muted)',
                          color: 'var(--color-accent)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 500,
                        }}>
                          Band {book.seriesPosition}
                        </span>
                      )}
                    </div>

                    {/* Radio indicator */}
                    <div style={{
                      width: '1.125rem', height: '1.125rem',
                      borderRadius: 'var(--radius-full)',
                      border: `2px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      background: isSelected ? 'var(--color-accent)' : 'transparent',
                      flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all var(--transition)',
                    }}>
                      {isSelected && <Check style={{ width: '0.6rem', height: '0.6rem', color: 'var(--color-text-inverse)', strokeWidth: 3 }} />}
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Band-Nummer — nur wenn Buch ausgewählt */}
          {selectedBookId && (
            <div className="anim-fade-in" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <p className="label-caps" style={{ flexShrink: 0 }}>Band-Nr.</p>
              <input
                type="number"
                className="input"
                style={{ width: '6rem' }}
                value={position}
                onChange={e => setPosition(parseInt(e.target.value) || 1)}
                min="1"
              />
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="modal-box__footer">
          <button type="button" onClick={onClose} disabled={isLoading}
            className="btn btn-ghost" style={{ flex: 1 }}>
            Abbrechen
          </button>
          <button type="button" onClick={handleSubmit}
            disabled={isLoading || !selectedBookId}
            className="btn btn-primary"
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
              opacity: !selectedBookId ? 0.45 : 1,
            }}>
            {isLoading ? <Spinner /> : null}
            Hinzuf\u00fcgen
          </button>
        </div>
      </div>
    </div>
  ) : null

  return createPortal(modal, document.body)
}
