'use client'

import { useState, useRef, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Book, updateSeriesRating } from '@/lib/db'
import { X, Trash2, Edit2, Save, Star, StarHalf, Upload, Link as LinkIcon, BookOpen } from 'lucide-react'
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

// Custom CSS spinner — no DaisyUI loading class
function Spinner() {
  return (
    <span
      className="inline-block w-3.5 h-3.5 rounded-full animate-spin"
      style={{
        border: '2px solid var(--color-text-faint)',
        borderTopColor: 'var(--color-text-inverse)',
      }}
      aria-hidden="true"
    />
  )
}

// Inline StarRating used in both view and edit modes
function StarRatingView({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const n = i + 1
        if (rating >= n)
          return <Star key={n} className="w-4.5 h-4.5" style={{ fill: 'var(--color-star)', color: 'var(--color-star)' }} />
        if (rating >= n - 0.5)
          return <StarHalf key={n} className="w-4.5 h-4.5" style={{ fill: 'var(--color-star)', color: 'var(--color-star)' }} />
        return <Star key={n} className="w-4.5 h-4.5" style={{ color: 'var(--color-text-faint)' }} />
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
  const [editedCoverType, setEditedCoverType] = useState(book.coverType)
  const [editedCoverUrl, setEditedCoverUrl]   = useState(book.coverUrl || '')
  const [editedCoverBlob, setEditedCoverBlob] = useState<Blob | null>(book.coverBlob || null)
  const [coverPreview, setCoverPreview]     = useState<string | null>(null)
  const [isDeleting, setIsDeleting]         = useState(false)
  const [isSaving, setIsSaving]             = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [burstIdx, setBurstIdx]             = useState<number | null>(null)
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
    }
  }, [book])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Nur Bilddateien'); return }
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

  const handleUrlChange = (url: string) => {
    setEditedCoverUrl(url)
    setCoverPreview(url || null)
    setEditedCoverType(url ? 'url' : 'none')
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
    if (!editedTitle.trim() || !editedAuthor.trim()) { alert('Pflichtfelder leer'); return }
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
    if (!confirm(`„${book.title}\u201c wirklich l\u00f6schen?`)) return
    setIsDeleting(true)
    try {
      await db.books.delete(book.id!)
      if (book.seriesId) await updateSeriesRating(book.seriesId)
      onClose()
    } finally { setIsDeleting(false) }
  }

  const handleStarClick = (val: number) => {
    setEditedRating(val)
    setBurstIdx(val)
    setTimeout(() => setBurstIdx(null), 280)
  }

  if (!isOpen) return null

  const statusCls = { unread: 'status-unread', reading: 'status-reading', finished: 'status-finished' }

  // Status button styles — no DaisyUI
  const statusBtnStyle = (value: string) => ({
    padding: '0.5rem 0',
    borderRadius: 'var(--radius-lg)',
    fontSize: 'var(--text-sm)',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'background var(--transition), color var(--transition)',
    background: editedStatus === value ? 'var(--color-accent)' : 'var(--color-surface-2)',
    color: editedStatus === value ? 'var(--color-text-inverse)' : 'var(--color-text-muted)',
    boxShadow: editedStatus === value ? 'var(--shadow-sm)' : 'none',
  } as React.CSSProperties)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 anim-fade-in"
        style={{ background: 'oklch(0.08 0.01 60 / 0.72)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      <div className="modal-panel relative w-full sm:max-w-lg max-h-[94dvh] overflow-y-auto rounded-t-2xl sm:rounded-lg anim-modal">

        {/* Handle bar (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--color-border)' }} />
        </div>

        {/* Hero: Cover + Title side by side */}
        <div className="flex gap-4 px-5 pt-4 pb-4">
          {/* Cover */}
          <div className="flex-shrink-0 relative">
            <div
              className="w-20 rounded-md overflow-hidden"
              style={{ height: '7.5rem', background: 'var(--color-surface-2)', boxShadow: 'var(--shadow-md)' }}
            >
              {coverPreview ? (
                <img src={coverPreview} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6" style={{ color: 'var(--color-text-faint)' }} />
                </div>
              )}
            </div>
            {isEditing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingCover}
                className="absolute inset-0 rounded-md flex items-center justify-center text-xs font-medium opacity-0 hover:opacity-100 transition-opacity"
                style={{ background: 'oklch(0.08 0.01 60 / 0.55)', color: 'var(--color-text)' }}
                aria-label="Cover ändern"
              >
                <Upload className="w-4 h-4" />
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*"
              className="hidden" onChange={handleFileUpload} disabled={isUploadingCover} />
          </div>

          {/* Title block */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
            {isEditing ? (
              <>
                <input className="bib-input text-sm" value={editedTitle}
                  onChange={e => setEditedTitle(e.target.value)} placeholder="Titel" disabled={isSaving} />
                <input className="bib-input text-sm" value={editedAuthor}
                  onChange={e => setEditedAuthor(e.target.value)} placeholder="Autor" disabled={isSaving} />
                <div className="relative">
                  <input type="url" className="bib-input text-xs pr-8"
                    placeholder="Cover-URL (optional)"
                    value={editedCoverUrl}
                    onChange={e => handleUrlChange(e.target.value)}
                    disabled={isSaving}
                  />
                  {editedCoverUrl && (
                    <button type="button" onClick={() => handleUrlChange(editedCoverUrl)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--color-text-faint)' }}>
                      <LinkIcon className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display" style={{ fontSize: 'var(--text-lg)', fontWeight: '600', lineHeight: 'var(--leading-snug)' }}>
                  {book.title}
                </h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  {book.author}
                </p>
                <span className={statusCls[book.status]}>
                  {STATUS_LABEL[book.status]}
                </span>
                {series && (
                  <p className="label-caps" style={{ color: 'var(--color-accent)' }}>
                    {series.name}{book.seriesPosition ? ` · Band ${book.seriesPosition}` : ''}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Close / Edit buttons */}
          <div className="flex flex-col gap-1.5 items-end">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-md transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'; (e.currentTarget as HTMLButtonElement).style.background = 'oklch(from var(--color-text) l c h / 0.06)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
              aria-label="Schließen"
            >
              <X className="w-4 h-4" />
            </button>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="w-8 h-8 flex items-center justify-center rounded-md transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent-muted)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                aria-label="Bearbeiten"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="bib-divider mx-5" />

        {/* Edit / View body */}
        {isEditing ? (
          <div className="px-5 pt-4 pb-3 flex flex-col gap-4">
            {/* Status pill buttons */}
            <div className="flex flex-col gap-1.5">
              <label className="label-caps">Status</label>
              <div className="grid grid-cols-3 gap-1.5">
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <button key={value} type="button"
                    onClick={() => setEditedStatus(value)}
                    disabled={isSaving}
                    style={statusBtnStyle(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Star rating */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="label-caps">Bewertung</label>
                <span
                  className="tabular-nums"
                  style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}
                >
                  {editedRating > 0 ? `${editedRating} / 5` : '—'}
                </span>
              </div>
              {/* Clickable stars */}
              <div className="flex gap-1.5">
                {Array.from({ length: 5 }, (_, i) => {
                  const full = i + 1
                  const half = i + 0.5
                  const filled = editedRating >= full
                  const halfFilled = !filled && editedRating >= half
                  const isBursting = burstIdx === full || burstIdx === half
                  return (
                    <div key={i} className="flex">
                      {/* Half-star */}
                      <button
                        type="button"
                        onClick={() => handleStarClick(half)}
                        className="w-3 overflow-hidden"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        aria-label={`${half} Sterne`}
                      >
                        <Star
                          className={`w-6 h-6 ${isBursting && burstIdx === half ? 'animate-star-burst' : ''}`}
                          style={{
                            fill: halfFilled || filled ? 'var(--color-star)' : 'transparent',
                            color: halfFilled || filled ? 'var(--color-star)' : 'var(--color-text-faint)',
                            transition: 'fill 100ms ease, color 100ms ease',
                          }}
                        />
                      </button>
                      {/* Full-star */}
                      <button
                        type="button"
                        onClick={() => handleStarClick(full)}
                        className="w-3 overflow-hidden"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        aria-label={`${full} Sterne`}
                      >
                        <Star
                          className={`w-6 h-6 -ml-3 ${isBursting && burstIdx === full ? 'animate-star-burst' : ''}`}
                          style={{
                            fill: filled ? 'var(--color-star)' : 'transparent',
                            color: filled ? 'var(--color-star)' : 'var(--color-text-faint)',
                            transition: 'fill 100ms ease, color 100ms ease',
                          }}
                        />
                      </button>
                    </div>
                  )
                })}
              </div>
              {/* Range fallback for fine adjustment */}
              <input
                type="range" min="0" max="5" step="0.5"
                value={editedRating}
                onChange={e => setEditedRating(parseFloat(e.target.value))}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{
                  accentColor: 'var(--color-star)',
                  background: `linear-gradient(to right, var(--color-star) ${editedRating / 5 * 100}%, var(--color-surface-2) ${editedRating / 5 * 100}%)`,
                }}
              />
            </div>

            {/* Series position */}
            {book.seriesId && (
              <div className="flex flex-col gap-1.5">
                <label className="label-caps">Bandnummer</label>
                <input type="number" min={1} value={editedPosition}
                  onChange={e => setEditedPosition(parseInt(e.target.value) || 1)}
                  className="bib-input w-24" disabled={isSaving} />
              </div>
            )}
          </div>
        ) : (
          /* View mode */
          <div className="px-5 pt-4 pb-3 flex flex-col gap-3">
            {(book.rating ?? 0) > 0 && (
              <div className="flex items-center gap-2">
                <StarRatingView rating={book.rating ?? 0} />
                <span
                  className="tabular-nums"
                  style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}
                >
                  {book.rating} / 5
                </span>
              </div>
            )}
            <p className="label-caps">
              Hinzugefügt {new Date(book.dateAdded).toLocaleDateString('de-DE', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 pb-5 pt-1 flex items-center justify-between gap-2">
          <button
            onClick={handleDelete}
            disabled={isDeleting || isSaving}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--color-error)' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'oklch(from var(--color-error) l c h / 0.08)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Lösche…' : 'Löschen'}
          </button>

          {isEditing ? (
            <div className="flex gap-2">
              <button onClick={cancelEdit} disabled={isSaving} className="btn-bib-ghost">
                Abbrechen
              </button>
              <button onClick={handleSave} disabled={isSaving || isUploadingCover} className="btn-bib-primary">
                {isSaving ? <Spinner /> : <><Save className="w-3.5 h-3.5" /> Speichern</>}
              </button>
            </div>
          ) : (
            <button onClick={onClose} className="btn-bib-ghost">Schließen</button>
          )}
        </div>
      </div>
    </div>
  )
}
