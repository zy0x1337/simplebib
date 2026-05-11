'use client'

import { useState, useRef, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Book, updateSeriesRating } from '@/lib/db'
import { X, Trash2, Edit2, Save, Star, StarHalf, Upload, BookOpen } from 'lucide-react'
import { compressImage } from '@/lib/imageUtils'

interface BookDetailsModalProps {
  book: Book
  isOpen: boolean
  onClose: () => void
}

const STATUS_OPTIONS = [
  { value: 'unread',   label: 'Ungelesen' },
  { value: 'reading',  label: 'Lese ich'  },
  { value: 'finished', label: 'Gelesen'   },
] as const

const STATUS_LABEL: Record<string, string> = {
  unread: 'Ungelesen', reading: 'Lese ich', finished: 'Gelesen',
}
const STATUS_CLS: Record<string, string> = {
  unread: 'status-unread', reading: 'status-reading', finished: 'status-finished',
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

function StarRatingView({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: '0.2rem' }}>
      {Array.from({ length: 5 }, (_, i) => {
        const n = i + 1
        if (rating >= n)       return <Star     key={n} style={{ width: '1.1rem', height: '1.1rem', fill: 'var(--color-star)', color: 'var(--color-star)' }} />
        if (rating >= n - 0.5) return <StarHalf key={n} style={{ width: '1.1rem', height: '1.1rem', fill: 'var(--color-star)', color: 'var(--color-star)' }} />
        return                        <Star     key={n} style={{ width: '1.1rem', height: '1.1rem', color: 'var(--color-border)' }} />
      })}
    </div>
  )
}

export function BookDetailsModal({ book, isOpen, onClose }: BookDetailsModalProps) {
  const [isEditing, setIsEditing]           = useState(false)
  const [editedTitle, setEditedTitle]       = useState(book.title)
  const [editedAuthor, setEditedAuthor]     = useState(book.author)
  const [editedStatus, setEditedStatus]     = useState(book.status)
  const [editedRating, setEditedRating]     = useState(book.rating || 0)
  const [editedPosition, setEditedPosition] = useState(book.seriesPosition || 1)
  const [editedCoverUrl, setEditedCoverUrl] = useState(book.coverUrl || '')
  const [editedCoverBlob, setEditedCoverBlob] = useState<Blob | null>(book.coverBlob || null)
  const [editedCoverType, setEditedCoverType] = useState(book.coverType)
  const [coverPreview, setCoverPreview]     = useState<string | null>(null)
  const [isDeleting, setIsDeleting]         = useState(false)
  const [isSaving, setIsSaving]             = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const series = useLiveQuery(
    () => book.seriesId ? db.series.get(book.seriesId) : undefined,
    [book.seriesId]
  )

  useEffect(() => {
    if (book.coverType === 'upload' && book.coverBlob) {
      const url = URL.createObjectURL(book.coverBlob)
      setCoverPreview(url)
      return () => URL.revokeObjectURL(url)
    } else if (book.coverType === 'url' && book.coverUrl) {
      setCoverPreview(book.coverUrl)
    } else {
      setCoverPreview(null)
    }
  }, [book])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Nur Bilddateien erlaubt'); return }
    if (file.size > 5 * 1024 * 1024)    { alert('Max. 5 MB'); return }
    setIsUploadingCover(true)
    try {
      const compressed = await compressImage(file)
      setEditedCoverBlob(compressed)
      setCoverPreview(URL.createObjectURL(compressed))
      setEditedCoverType('upload')
    } catch { alert('Fehler beim Verarbeiten') }
    finally  { setIsUploadingCover(false) }
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditedTitle(book.title)
    setEditedAuthor(book.author)
    setEditedStatus(book.status)
    setEditedRating(book.rating || 0)
    setEditedPosition(book.seriesPosition || 1)
    setEditedCoverType(book.coverType)
    setEditedCoverUrl(book.coverUrl || '')
    setEditedCoverBlob(book.coverBlob || null)
  }

  const handleSave = async () => {
    if (!editedTitle.trim() || !editedAuthor.trim()) { alert('Titel und Autor sind Pflichtfelder'); return }
    setIsSaving(true)
    try {
      await db.books.update(book.id!, {
        title:          editedTitle.trim(),
        author:         editedAuthor.trim(),
        status:         editedStatus,
        rating:         editedRating,
        seriesPosition: editedPosition,
        coverType:      editedCoverType,
        coverUrl:       editedCoverType === 'url'    ? editedCoverUrl   : undefined,
        coverBlob:      editedCoverType === 'upload' ? editedCoverBlob! : undefined,
      })
      if (book.seriesId) await updateSeriesRating(book.seriesId)
      setIsEditing(false)
    } catch { alert('Fehler beim Speichern') }
    finally  { setIsSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm(`\u201e${book.title}\u201c wirklich l\u00f6schen?`)) return
    setIsDeleting(true)
    try {
      await db.books.delete(book.id!)
      if (book.seriesId) await updateSeriesRating(book.seriesId)
      onClose()
    } finally { setIsDeleting(false) }
  }

  if (!isOpen) return null

  /* ── Shared label style ── */
  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-xs)',
    fontWeight: 600,
    letterSpacing: 'var(--tracking-widest)',
    textTransform: 'uppercase',
    color: 'var(--color-text-faint)',
    marginBottom: 'var(--space-2)',
    display: 'block',
  }

  return (
    <div className="modal-overlay anim-fade-in" onClick={onClose}>
      <div
        className="modal-box anim-modal-in"
        style={{ maxWidth: '480px' }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-details-title"
      >
        {/* ── Handle ── */}
        <div className="modal-box__handle">
          <div className="modal-box__handle-bar" />
        </div>

        {/* ─────────────────────────────────────────────
             HEADER — sticky, always visible
        ───────────────────────────────────────────── */}
        <div className="modal-box__header">
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>

            {/* Cover */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '4.5rem',
                height: '6.75rem',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'var(--color-surface-2)',
                boxShadow: 'var(--shadow-book)',
                border: '1px solid var(--color-border)',
              }}>
                {coverPreview ? (
                  <img src={coverPreview} alt={book.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-text-faint)' }} />
                  </div>
                )}
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingCover}
                  aria-label="Cover ändern"
                  style={{
                    position: 'absolute', inset: 0,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'oklch(0.05 0.01 60 / 0.7)',
                    border: 'none', cursor: 'pointer', color: 'white',
                  }}
                >
                  <Upload style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*"
                style={{ display: 'none' }} onChange={handleFileUpload} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <input className="input" value={editedTitle} onChange={e => setEditedTitle(e.target.value)}
                    placeholder="Titel" disabled={isSaving} style={{ fontWeight: 600 }} />
                  <input className="input" value={editedAuthor} onChange={e => setEditedAuthor(e.target.value)}
                    placeholder="Autor" disabled={isSaving} />
                  <input className="input" type="url" value={editedCoverUrl}
                    onChange={e => {
                      setEditedCoverUrl(e.target.value)
                      setCoverPreview(e.target.value || null)
                      setEditedCoverType(e.target.value ? 'url' : 'none')
                    }}
                    placeholder="Cover-URL" disabled={isSaving}
                    style={{ fontSize: 'var(--text-xs)' }}
                  />
                </div>
              ) : (
                <>
                  <h2 id="book-details-title" style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-lg)',
                    fontStyle: 'italic',
                    fontWeight: 400,
                    letterSpacing: 'var(--tracking-tight)',
                    lineHeight: 'var(--leading-snug)',
                    color: 'var(--color-text)',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {book.title}
                  </h2>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                    {book.author}
                  </p>
                  {series && (
                    <p style={{
                      fontSize: 'var(--text-xs)', fontWeight: 600,
                      letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase',
                      color: 'var(--color-accent)', marginTop: 'var(--space-1)',
                    }}>
                      {series.name}{book.seriesPosition ? ` · Band ${book.seriesPosition}` : ''}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <span className={STATUS_CLS[book.status]}>{STATUS_LABEL[book.status]}</span>
                    {(book.rating ?? 0) > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <StarRatingView rating={book.rating ?? 0} />
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{book.rating}/5</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Actions top-right */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', flexShrink: 0 }}>
              <button onClick={onClose} className="btn btn-icon btn-ghost" aria-label="Schließen">
                <X style={{ width: '1.1rem', height: '1.1rem' }} />
              </button>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="btn btn-icon btn-ghost"
                  aria-label="Bearbeiten" style={{ color: 'var(--color-accent)' }}>
                  <Edit2 style={{ width: '1.1rem', height: '1.1rem' }} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="modal-box__divider" />

        {/* ─────────────────────────────────────────────
             BODY — scrollable
        ───────────────────────────────────────────── */}
        <div className="modal-box__body">
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

              {/* Status */}
              <div>
                <span style={labelStyle}>Status</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
                  {STATUS_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value} type="button"
                      onClick={() => setEditedStatus(value)}
                      disabled={isSaving}
                      style={{
                        padding: '0.75rem 0',
                        minHeight: '48px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid',
                        borderColor: editedStatus === value ? 'var(--color-accent)' : 'var(--color-border)',
                        background: editedStatus === value ? 'var(--color-accent)' : 'var(--color-surface-2)',
                        color: editedStatus === value ? 'var(--color-text-inverse)' : 'var(--color-text-muted)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: editedStatus === value ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all var(--transition)',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Star rating */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <span style={labelStyle}>Bewertung</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {editedRating > 0 ? `${editedRating} / 5` : '—'}
                  </span>
                </div>
                {/* Star row with large touch targets */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', marginBottom: 'var(--space-3)' }}>
                  {Array.from({ length: 5 }, (_, i) => {
                    const full = i + 1
                    const half = i + 0.5
                    const filled   = editedRating >= full
                    const halfFill = !filled && editedRating >= half
                    return (
                      <div key={i} style={{ position: 'relative', width: '2.75rem', height: '2.75rem' }}>
                        {/* Half click zone */}
                        <button type="button" onClick={() => setEditedRating(editedRating === half ? 0 : half)}
                          aria-label={`${half} Sterne`}
                          style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%', background: 'none', border: 'none', cursor: 'pointer', zIndex: 1 }} />
                        {/* Full click zone */}
                        <button type="button" onClick={() => setEditedRating(editedRating === full ? 0 : full)}
                          aria-label={`${full} Sterne`}
                          style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', background: 'none', border: 'none', cursor: 'pointer', zIndex: 1 }} />
                        {/* Icon */}
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                          {halfFill
                            ? <StarHalf style={{ width: '2rem', height: '2rem', fill: 'var(--color-star)', color: 'var(--color-star)', transition: 'all 120ms ease' }} />
                            : <Star    style={{ width: '2rem', height: '2rem', fill: filled ? 'var(--color-star)' : 'none', color: filled ? 'var(--color-star)' : 'var(--color-border)', transition: 'all 120ms ease' }} />
                          }
                        </div>
                      </div>
                    )
                  })}
                </div>
                <input type="range" min="0" max="5" step="0.5" value={editedRating}
                  onChange={e => setEditedRating(parseFloat(e.target.value))}
                  className="bib-range"
                  style={{ background: `linear-gradient(to right, var(--color-star) ${editedRating / 5 * 100}%, var(--color-surface-2) ${editedRating / 5 * 100}%)` }}
                />
              </div>

              {/* Series position */}
              {book.seriesId && (
                <div>
                  <span style={labelStyle}>Bandnummer</span>
                  <input type="number" min={1} value={editedPosition}
                    onChange={e => setEditedPosition(parseInt(e.target.value) || 1)}
                    className="input" style={{ width: '7rem' }} disabled={isSaving} />
                </div>
              )}
            </div>
          ) : (
            /* View mode */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <p style={{ ...labelStyle, marginBottom: 0 }}>
                Hinzugefügt {new Date(book.dateAdded).toLocaleDateString('de-DE', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────
             FOOTER — sticky, safe-area aware
        ───────────────────────────────────────────── */}
        <div className="modal-box__footer">
          <button
            onClick={handleDelete}
            disabled={isDeleting || isSaving}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              background: 'none', border: 'none',
              fontSize: 'var(--text-sm)',
              color: 'oklch(from var(--color-error) l c h / 0.8)',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              transition: 'color var(--transition), background var(--transition)',
              minHeight: '44px',
              WebkitTapHighlightColor: 'transparent',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-error)'
              ;(e.currentTarget as HTMLButtonElement).style.background = 'oklch(from var(--color-error) l c h / 0.08)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLButtonElement).style.color = 'oklch(from var(--color-error) l c h / 0.8)'
              ;(e.currentTarget as HTMLButtonElement).style.background = 'none'
            }}
          >
            <Trash2 style={{ width: '1rem', height: '1rem' }} />
            {isDeleting ? 'Lösche…' : 'Löschen'}
          </button>

          {isEditing ? (
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button onClick={cancelEdit} disabled={isSaving} className="btn btn-ghost">Abbrechen</button>
              <button onClick={handleSave} disabled={isSaving || isUploadingCover} className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {isSaving ? <Spinner /> : <Save style={{ width: '0.875rem', height: '0.875rem' }} />}
                Speichern
              </button>
            </div>
          ) : (
            <button onClick={onClose} className="btn btn-ghost">Schließen</button>
          )}
        </div>
      </div>
    </div>
  )
}
