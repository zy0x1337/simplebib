'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Book, deleteBook, updateSeriesRating } from '@/lib/db'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { X, Trash2, Edit2, Save, Star, StarHalf, Upload, BookOpen, BookMarked, BookCheck } from 'lucide-react'
import { compressImage } from '@/lib/imageUtils'

interface BookDetailsModalProps {
  book: Book
  isOpen: boolean
  onClose: () => void
}

const STATUS_LABEL: Record<string, string> = {
  unread: 'Ungelesen', reading: 'Lese ich', finished: 'Gelesen',
}
const STATUS_CLS: Record<string, string> = {
  unread: 'status-unread', reading: 'status-reading', finished: 'status-finished',
}

const STATUS_OPTIONS = [
  { value: 'unread',   label: 'Ungelesen' },
  { value: 'reading',  label: 'Lese ich'  },
  { value: 'finished', label: 'Gelesen'   },
] as const

function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: '0.875rem', height: '0.875rem',
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
        if (rating >= n)
          return <Star key={n} style={{ width: '1rem', height: '1rem', fill: 'var(--color-star)', color: 'var(--color-star)' }} />
        if (rating >= n - 0.5)
          return <StarHalf key={n} style={{ width: '1rem', height: '1rem', fill: 'var(--color-star)', color: 'var(--color-star)' }} />
        return <Star key={n} style={{ width: '1rem', height: '1rem', fill: 'none', color: 'var(--color-border)' }} />
      })}
    </div>
  )
}

export function BookDetailsModal({ book, isOpen, onClose }: BookDetailsModalProps) {
  const [isEditing, setIsEditing]             = useState(false)
  const [editedTitle, setEditedTitle]         = useState(book.title)
  const [editedAuthor, setEditedAuthor]       = useState(book.author)
  const [editedStatus, setEditedStatus]       = useState(book.status)
  const [editedRating, setEditedRating]       = useState(book.rating || 0)
  const [editedPosition, setEditedPosition]   = useState(book.seriesPosition || 1)
  const [editedCoverUrl, setEditedCoverUrl]   = useState(book.coverUrl || '')
  const [editedCoverBlob, setEditedCoverBlob] = useState<Blob | null>(book.coverBlob || null)
  const [editedCoverType, setEditedCoverType] = useState(book.coverType)
  const [editedTags, setEditedTags]           = useState<string[]>(book.tags || [])
  const [tagInput, setTagInput]               = useState('')
  const [coverPreview, setCoverPreview]       = useState<string | null>(null)
  const [isDeleting, setIsDeleting]           = useState(false)
  const [isSaving, setIsSaving]               = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [mounted, setMounted]                 = useState(false)
  const fileInputRef  = useRef<HTMLInputElement>(null)
  const tagInputRef   = useRef<HTMLInputElement>(null)
  const scrollRef     = useRef(0)

  useEffect(() => { setMounted(true) }, [])

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
  }, [book.coverBlob, book.coverUrl, book.coverType])

  // Reset form when book changes
  useEffect(() => {
    setEditedTitle(book.title)
    setEditedAuthor(book.author)
    setEditedStatus(book.status)
    setEditedRating(book.rating || 0)
    setEditedPosition(book.seriesPosition || 1)
    setEditedCoverType(book.coverType)
    setEditedCoverUrl(book.coverUrl || '')
    setEditedCoverBlob(book.coverBlob || null)
    setEditedTags(book.tags || [])
    setTagInput('')
    setIsEditing(false)
  }, [book])

  // Scroll position save/restore
  useEffect(() => {
    if (isOpen) scrollRef.current = window.scrollY
  }, [isOpen])

  const handleClose = () => {
    onClose()
    requestAnimationFrame(() => window.scrollTo(0, scrollRef.current))
  }

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
    setEditedTags(book.tags || [])
    setTagInput('')
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (!t || editedTags.includes(t) || editedTags.length >= 3) return
    setEditedTags([...editedTags, t])
    setTagInput('')
    tagInputRef.current?.focus()
  }

  const removeTag = (t: string) => setEditedTags(editedTags.filter(x => x !== t))

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag() }
    if (e.key === 'Backspace' && !tagInput && editedTags.length > 0) {
      removeTag(editedTags[editedTags.length - 1])
    }
  }

  // Quick status change (no edit mode)
  const quickSetStatus = async (newStatus: 'unread' | 'reading' | 'finished') => {
    const patch: any = { status: newStatus }
    if (newStatus === 'finished') patch.dateRead = new Date()
    await db.books.update(book.id!, patch)
    if (book.seriesId) await updateSeriesRating(book.seriesId)
  }

  const handleSave = async () => {
    if (!editedTitle.trim() || !editedAuthor.trim()) { alert('Titel und Autor sind Pflichtfelder'); return }
    setIsSaving(true)
    try {
      await db.books.update(book.id!, {
        title:          editedTitle.trim(),
        author:         editedAuthor.trim(),
        status:         editedStatus,
        rating:         editedRating || undefined,
        tags:           editedTags.length > 0 ? editedTags : undefined,
        seriesPosition: editedPosition,
        coverType:      editedCoverType,
        coverUrl:       editedCoverType === 'url'    ? editedCoverUrl   : undefined,
        coverBlob:      editedCoverType === 'upload' ? editedCoverBlob! : undefined,
        dateRead:       editedStatus === 'finished'  ? new Date()      : book.dateRead,
      })
      if (book.seriesId) await updateSeriesRating(book.seriesId)
      setIsEditing(false)
    } catch { alert('Fehler beim Speichern') }
    finally  { setIsSaving(false) }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteBook(book.id!, book.seriesId)
      handleClose()
    } finally { setIsDeleting(false) }
  }

  if (!isOpen || !mounted) return null

  const modal = (
    <>
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Buch löschen?"
        message={`„${book.title}“ wird unwiderruflich aus deiner Bibliothek entfernt.`}
        confirmLabel="Löschen"
        confirmStyle="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <div className="modal-overlay anim-fade-in" onClick={handleClose}>
        <div
          className="modal-box anim-modal-in"
          style={{ maxWidth: '480px' }}
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="book-details-title"
        >
          {/* Handle — mobile only */}
          <div className="modal-box__handle">
            <div className="modal-box__handle-bar" />
          </div>

          {/* ── HEADER ────────────────────────────────────── */}
          <div className="modal-box__header">
            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>

              {/* Cover */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '4.5rem', height: '6.75rem',
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
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingCover} aria-label="Cover ändern"
                    style={{
                      position: 'absolute', inset: 0,
                      borderRadius: 'var(--radius-md)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'oklch(0.05 0.01 60 / 0.65)',
                      border: 'none', cursor: 'pointer', color: 'white',
                    }}>
                    <Upload style={{ width: '1.25rem', height: '1.25rem' }} />
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*"
                  style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploadingCover} />
              </div>

              {/* Title / Author / Status */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <input className="input" value={editedTitle}
                      onChange={e => setEditedTitle(e.target.value)}
                      placeholder="Titel" disabled={isSaving} style={{ fontWeight: 600 }} />
                    <input className="input" value={editedAuthor}
                      onChange={e => setEditedAuthor(e.target.value)}
                      placeholder="Autor" disabled={isSaving} />
                    <input className="input" type="url" value={editedCoverUrl}
                      onChange={e => {
                        setEditedCoverUrl(e.target.value)
                        if (e.target.value) { setCoverPreview(e.target.value); setEditedCoverType('url') }
                        else setEditedCoverType('none')
                      }}
                      placeholder="Cover-URL (optional)" disabled={isSaving}
                      style={{ fontSize: 'var(--text-xs)' }} />
                  </div>
                ) : (
                  <>
                    <h2 id="book-details-title" style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--text-base)',
                      fontStyle: 'italic',
                      fontWeight: 400,
                      letterSpacing: 'var(--tracking-tight)',
                      lineHeight: 'var(--leading-snug)',
                      color: 'var(--color-text)',
                      wordBreak: 'break-word',
                    }}>{book.title}</h2>
                    <p style={{
                      fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)',
                      marginTop: 'var(--space-1)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{book.author}</p>
                    {series && (
                      <p style={{
                        fontSize: 'var(--text-xs)', fontWeight: 600,
                        letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase',
                        color: 'var(--color-accent)', marginTop: 'var(--space-1)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {series.name}{book.seriesPosition ? ` · Band ${book.seriesPosition}` : ''}
                      </p>
                    )}
                    <div style={{ marginTop: 'var(--space-2)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span className={STATUS_CLS[book.status]}>{STATUS_LABEL[book.status]}</span>
                      {(book.rating ?? 0) > 0 && <StarRatingView rating={book.rating ?? 0} />}
                    </div>
                    {/* Tags display */}
                    {book.tags && book.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginTop: 'var(--space-2)' }}>
                        {book.tags.map(tag => (
                          <span key={tag} style={{
                            display: 'inline-flex', alignItems: 'center',
                            padding: '0.125rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--color-accent-muted)',
                            color: 'var(--color-accent)',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 500,
                            letterSpacing: 'var(--tracking-wide)',
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Close + Edit */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', flexShrink: 0 }}>
                <button onClick={handleClose} className="btn btn-icon btn-ghost" aria-label="Schließen">
                  <X style={{ width: '1rem', height: '1rem' }} />
                </button>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="btn btn-icon btn-ghost"
                    aria-label="Bearbeiten" style={{ color: 'var(--color-accent)' }}>
                    <Edit2 style={{ width: '1rem', height: '1rem' }} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="modal-box__divider" />

          {/* ── BODY ──────────────────────────────────────── */}
          <div className="modal-box__body">
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

                {/* Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <p className="label-caps">Status</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
                    {STATUS_OPTIONS.map(({ value, label }) => (
                      <button key={value} type="button"
                        onClick={() => setEditedStatus(value)} disabled={isSaving}
                        style={{
                          padding: '0.6rem 0',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid',
                          borderColor: editedStatus === value ? 'var(--color-accent)' : 'var(--color-border)',
                          background: editedStatus === value ? 'var(--color-accent)' : 'var(--color-surface-2)',
                          color: editedStatus === value ? 'var(--color-text-inverse)' : 'var(--color-text-muted)',
                          fontSize: 'var(--text-sm)',
                          fontWeight: editedStatus === value ? 600 : 400,
                          cursor: 'pointer',
                          transition: 'all var(--transition)',
                        }}
                      >{label}</button>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p className="label-caps">Bewertung</p>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                      {editedRating > 0 ? `${editedRating} / 5` : '—'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                    {Array.from({ length: 5 }, (_, i) => {
                      const full = i + 1, half = i + 0.5
                      const filled = editedRating >= full
                      const halfFilled = !filled && editedRating >= half
                      return (
                        <div key={i} style={{ position: 'relative' }}>
                          <button type="button" onClick={() => setEditedRating(p => p === half ? 0 : half)}
                            style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, zIndex: 1 }}
                            aria-label={`${half} Sterne`} />
                          <button type="button" onClick={() => setEditedRating(p => p === full ? 0 : full)}
                            style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, zIndex: 1 }}
                            aria-label={`${full} Sterne`} />
                          {halfFilled
                            ? <StarHalf style={{ width: '1.75rem', height: '1.75rem', fill: 'var(--color-star)', color: 'var(--color-star)', pointerEvents: 'none' }} />
                            : <Star style={{ width: '1.75rem', height: '1.75rem', fill: filled ? 'var(--color-star)' : 'none', color: filled ? 'var(--color-star)' : 'var(--color-border)', pointerEvents: 'none', transition: 'fill 120ms ease' }} />
                          }
                        </div>
                      )
                    })}
                    {editedRating > 0 && (
                      <button type="button" onClick={() => setEditedRating(0)}
                        style={{ marginLeft: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                        zurücksetzen
                      </button>
                    )}
                  </div>
                  <input type="range" min="0" max="5" step="0.5" value={editedRating}
                    onChange={e => setEditedRating(parseFloat(e.target.value))}
                    className="bib-range"
                    style={{ background: `linear-gradient(to right, var(--color-star) ${editedRating / 5 * 100}%, var(--color-surface-2) ${editedRating / 5 * 100}%)` }}
                  />
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <p className="label-caps">Tags</p>
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)',
                    padding: editedTags.length > 0 ? 'var(--space-2)' : 0,
                    background: editedTags.length > 0 ? 'var(--color-surface-2)' : 'transparent',
                    borderRadius: 'var(--radius-md)',
                    border: editedTags.length > 0 ? '1px solid var(--color-border)' : 'none',
                    minHeight: '2.5rem', alignItems: 'center',
                  }}>
                    {editedTags.map(tag => (
                      <span key={tag} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--color-accent-muted)',
                        color: 'var(--color-accent)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 500,
                        letterSpacing: 'var(--tracking-wide)',
                      }}>
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)}
                          style={{
                            background: 'none', border: 'none', padding: 0,
                            color: 'inherit', cursor: 'pointer',
                            opacity: 0.6, display: 'flex',
                          }}>
                          <X style={{ width: '0.625rem', height: '0.625rem' }} />
                        </button>
                      </span>
                    ))}
                    {editedTags.length < 3 && (
                      <input
                        ref={tagInputRef}
                        type="text"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        onBlur={addTag}
                        placeholder={editedTags.length === 0 ? 'z. B. Fantasy, Klassiker' : '+ Tag'}
                        disabled={isSaving}
                        style={{
                          border: 'none', background: 'transparent',
                          fontSize: 'var(--text-xs)', color: 'var(--color-text)',
                          outline: 'none', minWidth: '6rem', flex: 1,
                          padding: '0.125rem 0',
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Bandnummer */}
                {book.seriesId && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <p className="label-caps">Bandnummer</p>
                    <input type="number" min={1} value={editedPosition}
                      onChange={e => setEditedPosition(parseInt(e.target.value) || 1)}
                      className="input" style={{ width: '6rem' }} disabled={isSaving} />
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Quick status buttons */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                  {book.status !== 'reading' && (
                    <button onClick={() => quickSetStatus('reading')}
                      className="btn-bib-ghost" style={{ flex: 1, fontSize: 'var(--text-xs)', gap: 'var(--space-1)' }}>
                      <BookMarked style={{ width: '0.875rem', height: '0.875rem' }} />
                      Lese ich
                    </button>
                  )}
                  {book.status !== 'finished' && (
                    <button onClick={() => quickSetStatus('finished')}
                      className="btn-bib-ghost" style={{ flex: 1, fontSize: 'var(--text-xs)', gap: 'var(--space-1)' }}>
                      <BookCheck style={{ width: '0.875rem', height: '0.875rem' }} />
                      Gelesen
                    </button>
                  )}
                  {book.status !== 'unread' && (
                    <button onClick={() => quickSetStatus('unread')}
                      className="btn-bib-ghost" style={{ flex: 1, fontSize: 'var(--text-xs)', gap: 'var(--space-1)' }}>
                      <BookOpen style={{ width: '0.875rem', height: '0.875rem' }} />
                      Ungelesen
                    </button>
                  )}
                </div>

                {book.dateRead && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', fontStyle: 'italic' }}>
                    Gelesen am {new Date(book.dateRead).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
                <p className="label-caps" style={{ paddingTop: 'var(--space-1)' }}>
                  Hinzugefügt {new Date(book.dateAdded).toLocaleDateString('de-DE', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              </>
            )}
          </div>

          {/* ── FOOTER ────────────────────────────────────── */}
          <div className="modal-box__footer">
            <button onClick={() => setShowDeleteConfirm(true)} disabled={isDeleting || isSaving}
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
              <button onClick={handleClose} className="btn btn-ghost">Schließen</button>
            )}
          </div>
        </div>
      </div>
    </>
  )
  return createPortal(modal, document.body)
}
