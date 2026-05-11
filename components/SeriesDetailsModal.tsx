'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Series, Book } from '@/lib/db'
import { X, Plus, Trash2, BookOpen, Star, StarHalf, Edit2, Save } from 'lucide-react'
import { AddBookToSeriesModal } from './AddBookToSeriesModal'
import { BookDetailsModal } from './BookDetailsModal'

interface SeriesDetailsModalProps {
  series: Series
  isOpen: boolean
  onClose: () => void
}

function BookCover({ book }: { book: Book }) {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    if (book.coverType === 'upload' && book.coverBlob) {
      const url = URL.createObjectURL(book.coverBlob)
      setSrc(url)
      return () => URL.revokeObjectURL(url)
    } else if (book.coverType === 'url' && book.coverUrl) {
      setSrc(book.coverUrl)
    } else { setSrc(null) }
  }, [book.coverBlob, book.coverUrl, book.coverType])

  return (
    <div style={{
      flexShrink: 0, width: '2rem', height: '3rem',
      borderRadius: 'var(--radius-sm)', overflow: 'hidden',
      background: 'var(--color-surface-2)',
      border: '1px solid var(--color-border)',
    }}>
      {src
        ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen style={{ width: '0.75rem', height: '0.75rem', color: 'var(--color-text-faint)' }} />
          </div>
      }
    </div>
  )
}

function MiniStars({ rating }: { rating?: number }) {
  if (!rating) return null
  return (
    <div style={{ display: 'flex', gap: '0.15rem', alignItems: 'center' }}>
      {Array.from({ length: 5 }, (_, i) => {
        const n = i + 1
        if (rating >= n)       return <Star     key={n} style={{ width: '0.7rem', height: '0.7rem', fill: 'var(--color-star)', color: 'var(--color-star)' }} />
        if (rating >= n - 0.5) return <StarHalf key={n} style={{ width: '0.7rem', height: '0.7rem', fill: 'var(--color-star)', color: 'var(--color-star)' }} />
        return                         <Star     key={n} style={{ width: '0.7rem', height: '0.7rem', fill: 'none',               color: 'var(--color-border)' }} />
      })}
    </div>
  )
}

export function SeriesDetailsModal({ series, isOpen, onClose }: SeriesDetailsModalProps) {
  const [isAddBookOpen, setIsAddBookOpen] = useState(false)
  const [selectedBook, setSelectedBook]   = useState<Book | null>(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName]       = useState(series.name)
  const [isDeleting, setIsDeleting]       = useState(false)
  const [isSavingName, setIsSavingName]   = useState(false)
  const [mounted, setMounted]             = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const booksInSeries = useLiveQuery(
    () => db.books.where('seriesId').equals(series.id!).toArray()
          .then(bs => bs.sort((a, b) => (a.seriesPosition || 0) - (b.seriesPosition || 0))),
    [series.id]
  )

  const handleSaveName = async () => {
    if (!editedName.trim()) return
    setIsSavingName(true)
    try { await db.series.update(series.id!, { name: editedName.trim() }); setIsEditingName(false) }
    finally { setIsSavingName(false) }
  }

  const handleDelete = async () => {
    if (!confirm(`Buchreihe \u201e${series.name}\u201c wirklich l\u00f6schen?\nB\u00fccher bleiben erhalten.`)) return
    setIsDeleting(true)
    try {
      const books = await db.books.where('seriesId').equals(series.id!).toArray()
      await Promise.all(books.map(b => db.books.update(b.id!, { seriesId: undefined, seriesPosition: undefined })))
      await db.series.delete(series.id!)
      onClose()
    } finally { setIsDeleting(false) }
  }

  const handleOpenAddBook = () => {
    onClose()
    setIsAddBookOpen(true)
  }

  const STATUS_CLS:   Record<string, string> = { unread: 'status-unread', reading: 'status-reading', finished: 'status-finished' }
  const STATUS_LABEL: Record<string, string> = { unread: 'Ungelesen', reading: 'Lese ich', finished: 'Gelesen' }

  const totalBooks    = booksInSeries?.length ?? 0
  const finishedBooks = booksInSeries?.filter(b => b.status === 'finished').length ?? 0
  const readingBooks  = booksInSeries?.filter(b => b.status === 'reading').length  ?? 0

  // Main series portal — only render after hydration
  const seriesPortal = mounted ? createPortal(
    isOpen ? (
      <div className="modal-overlay anim-fade-in" onClick={onClose}>
        <div
          className="modal-box anim-modal-in"
          style={{ maxWidth: '480px' }}
          onClick={e => e.stopPropagation()}
          role="dialog" aria-modal="true" aria-labelledby="series-details-title"
        >
          <div className="modal-box__handle">
            <div className="modal-box__handle-bar" />
          </div>

          {/* HEADER */}
          <div className="modal-box__header">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
              <div style={{
                flexShrink: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                minWidth: '3rem', paddingTop: '0.1rem',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)',
                  fontWeight: 700, lineHeight: 1, color: 'var(--color-accent)',
                }}>{totalBooks}</span>
                <p className="label-caps" style={{ marginTop: '0.15rem' }}>
                  {totalBooks === 1 ? 'Buch' : 'B\u00fccher'}
                </p>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {isEditingName ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <input className="input" style={{ flex: 1, minWidth: 0, fontWeight: 600 }}
                      value={editedName} onChange={e => setEditedName(e.target.value)}
                      autoFocus disabled={isSavingName} />
                    <button onClick={handleSaveName} disabled={isSavingName}
                      className="btn btn-icon btn-ghost" aria-label="Speichern"
                      style={{ flexShrink: 0, color: 'var(--color-accent)' }}>
                      <Save style={{ width: '1rem', height: '1rem' }} />
                    </button>
                    <button onClick={() => { setIsEditingName(false); setEditedName(series.name) }}
                      className="btn btn-icon btn-ghost" aria-label="Abbrechen" style={{ flexShrink: 0 }}>
                      <X style={{ width: '1rem', height: '1rem' }} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <h2 id="series-details-title" style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--text-base)',
                      fontWeight: 400, fontStyle: 'italic',
                      letterSpacing: 'var(--tracking-tight)',
                      color: 'var(--color-text)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      lineHeight: 'var(--leading-snug)',
                      flex: 1, minWidth: 0,
                    }}>{series.name}</h2>
                    <button onClick={() => setIsEditingName(true)}
                      className="btn btn-icon btn-ghost" aria-label="Name bearbeiten"
                      style={{ flexShrink: 0 }}>
                      <Edit2 style={{ width: '0.875rem', height: '0.875rem' }} />
                    </button>
                  </div>
                )}

                {(series.overallRating ?? 0) > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                    <MiniStars rating={series.overallRating} />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                      \u00d8 {series.overallRating?.toFixed(1)}
                    </span>
                  </div>
                )}

                {totalBooks > 0 && (
                  <div style={{ marginTop: 'var(--space-2)', display: 'flex', gap: '0.125rem', height: '0.25rem' }}>
                    {Array.from({ length: totalBooks }, (_, i) => {
                      const idx = i + 1
                      const bg = idx <= finishedBooks ? 'var(--color-accent)'
                               : idx <= finishedBooks + readingBooks ? 'var(--color-reading)'
                               : 'var(--color-border)'
                      return <div key={i} style={{ flex: 1, borderRadius: 'var(--radius-full)', background: bg, transition: 'background var(--transition)' }} />
                    })}
                  </div>
                )}
              </div>

              <button onClick={onClose} className="btn btn-icon btn-ghost"
                style={{ flexShrink: 0, marginTop: '0.1rem' }} aria-label="Schlie\u00dfen">
                <X style={{ width: '1rem', height: '1rem' }} />
              </button>
            </div>
          </div>

          <div className="modal-box__divider" />

          {/* BODY */}
          <div className="modal-box__body">
            {!booksInSeries || booksInSeries.length === 0 ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 'var(--space-2)', padding: 'var(--space-10) 0',
                color: 'var(--color-text-faint)',
              }}>
                <BookOpen style={{ width: '2rem', height: '2rem' }} />
                <p style={{ fontSize: 'var(--text-sm)' }}>Noch keine B\u00fccher in dieser Reihe</p>
              </div>
            ) : (
              booksInSeries.map((book, idx) => (
                <button key={book.id} onClick={() => setSelectedBook(book)}
                  className="anim-fade-up"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    width: '100%', padding: 'var(--space-2)',
                    borderRadius: 'var(--radius-md)',
                    background: 'transparent', border: 'none',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'background var(--transition)',
                    animationDelay: `${idx * 0.04}s`,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'oklch(from var(--color-text) l c h / 0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{
                    flexShrink: 0, width: '1.5rem', textAlign: 'center',
                    fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)',
                    fontWeight: 700,
                    color: 'oklch(from var(--color-accent) l c h / 0.5)',
                  }}>{book.seriesPosition ?? '\u2013'}</span>
                  <BookCover book={book} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)',
                      fontStyle: 'italic', color: 'var(--color-text)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      lineHeight: 'var(--leading-snug)',
                    }}>{book.title}</p>
                    <MiniStars rating={book.rating} />
                  </div>
                  <span className={STATUS_CLS[book.status]} style={{ flexShrink: 0 }}>{STATUS_LABEL[book.status]}</span>
                </button>
              ))
            )}
          </div>

          {/* FOOTER */}
          <div className="modal-box__footer">
            <button onClick={handleDelete} disabled={isDeleting}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                background: 'none', border: 'none',
                fontSize: 'var(--text-sm)',
                color: 'oklch(from var(--color-error) l c h / 0.7)',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                transition: 'color var(--transition), background var(--transition)',
              }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-error)'
                ;(e.currentTarget as HTMLButtonElement).style.background = 'oklch(from var(--color-error) l c h / 0.08)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLButtonElement).style.color = 'oklch(from var(--color-error) l c h / 0.7)'
                ;(e.currentTarget as HTMLButtonElement).style.background = 'none'
              }}
            >
              <Trash2 style={{ width: '1rem', height: '1rem' }} />
              {isDeleting ? 'L\u00f6sche\u2026' : 'Reihe l\u00f6schen'}
            </button>

            <button onClick={handleOpenAddBook} className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Plus style={{ width: '1rem', height: '1rem' }} />
              Buch hinzuf\u00fcgen
            </button>
          </div>
        </div>
      </div>
    ) : null,
    document.body
  ) : null

  // Child modals are always rendered regardless of mounted state —
  // they manage their own portals and hydration guards internally.
  return (
    <>
      {seriesPortal}
      <AddBookToSeriesModal
        series={series}
        isOpen={isAddBookOpen}
        onClose={() => setIsAddBookOpen(false)}
      />
      {selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          isOpen={true}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </>
  )
}
