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
    if (!confirm(`„${book.title}“ wirklich löschen?`)) return
    setIsDeleting(true)
    try {
      await db.books.delete(book.id!)
      if (book.seriesId) await updateSeriesRating(book.seriesId)
      onClose()
    } finally { setIsDeleting(false) }
  }

  if (!isOpen) return null

  const statusCls = { unread: 'status-unread', reading: 'status-reading', finished: 'status-finished' }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-base-content/30 backdrop-blur-sm anim-fade-in" onClick={onClose} />

      <div className="modal-panel relative w-full sm:max-w-lg max-h-[94dvh]
                      overflow-y-auto rounded-t-2xl sm:rounded-lg anim-modal">

        {/* Handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-base-content/20" />
        </div>

        {/* Hero-Bereich: Cover + Titel nebeneinander */}
        <div className="flex gap-4 px-5 pt-4 pb-4">
          {/* Cover */}
          <div className="flex-shrink-0 relative">
            <div className="w-20 h-[7.5rem] rounded-md overflow-hidden bg-base-300 shadow-md">
              {coverPreview ? (
                <img src={coverPreview} alt={book.title}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-base-content/25" />
                </div>
              )}
            </div>
            {/* Cover bearbeiten */}
            {isEditing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingCover}
                className="absolute inset-0 rounded-md flex items-center justify-center
                           bg-base-content/40 text-base-100 text-xs font-medium
                           opacity-0 hover:opacity-100 transition-opacity"
                aria-label="Cover ändern"
              >
                <Upload className="w-4 h-4" />
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*"
              className="hidden" onChange={handleFileUpload} disabled={isUploadingCover} />
          </div>

          {/* Titel-Block */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
            {isEditing ? (
              <>
                <input className="bib-input text-sm" value={editedTitle}
                  onChange={e => setEditedTitle(e.target.value)} placeholder="Titel" disabled={isSaving} />
                <input className="bib-input text-sm" value={editedAuthor}
                  onChange={e => setEditedAuthor(e.target.value)} placeholder="Autor" disabled={isSaving} />
                {/* Cover-URL im Edit-Modus */}
                <div className="relative">
                  <input type="url" className="bib-input text-xs pr-8"
                    placeholder="Cover-URL (optional)"
                    value={editedCoverUrl}
                    onChange={e => handleUrlChange(e.target.value)}
                    disabled={isSaving}
                  />
                  {editedCoverUrl && (
                    <button type="button" onClick={() => handleUrlChange(editedCoverUrl)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40">
                      <LinkIcon className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-lg font-semibold leading-snug">{book.title}</h2>
                <p className="text-sm text-base-content/55">{book.author}</p>
                <span className={statusCls[book.status]}>
                  {STATUS_LABEL[book.status]}
                </span>
                {series && (
                  <p className="label-caps text-primary">
                    {series.name}{book.seriesPosition ? ` · Band ${book.seriesPosition}` : ''}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Action-Buttons oben rechts */}
          <div className="flex flex-col gap-1.5 items-end">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-md
                         text-base-content/40 hover:text-base-content hover:bg-base-content/6
                         transition-colors"
              aria-label="Schließen"
            >
              <X className="w-4 h-4" />
            </button>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="w-8 h-8 flex items-center justify-center rounded-md
                           text-base-content/40 hover:text-primary hover:bg-primary/8
                           transition-colors"
                aria-label="Bearbeiten"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="bib-divider mx-5" />

        {/* Edit-Felder */}
        {isEditing ? (
          <div className="px-5 pt-4 pb-3 flex flex-col gap-3">
            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label className="label-caps">Status</label>
              <div className="grid grid-cols-3 gap-1.5">
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <button key={value} type="button"
                    onClick={() => setEditedStatus(value)}
                    disabled={isSaving}
                    className={`py-2 rounded-lg text-sm font-medium transition-all duration-150
                      ${ editedStatus === value
                        ? 'bg-primary text-primary-content shadow-sm'
                        : 'bg-base-200 text-base-content/60 hover:bg-base-300'
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="label-caps">Bewertung</label>
                <span className="text-xs text-base-content/40 tabular-nums">
                  {editedRating > 0 ? `${editedRating} / 5` : '—'}
                </span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, i) => {
                  const n = i + 1
                  return editedRating >= n
                    ? <Star key={n} className="w-6 h-6 fill-warning text-warning cursor-pointer" onClick={() => setEditedRating(n)} />
                    : editedRating >= n - 0.5
                    ? <StarHalf key={n} className="w-6 h-6 fill-warning text-warning cursor-pointer" onClick={() => setEditedRating(n - 0.5)} />
                    : <Star key={n} className="w-6 h-6 text-base-content/20 cursor-pointer hover:text-warning/50 transition-colors" onClick={() => setEditedRating(n)} />
                })}
              </div>
              <input type="range" min="0" max="5" step="0.5" value={editedRating}
                onChange={e => setEditedRating(parseFloat(e.target.value))}
                className="range range-xs range-warning" />
            </div>

            {/* Bandnummer */}
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
          /* View-Modus: Rating + Datum */
          <div className="px-5 pt-4 pb-3 flex flex-col gap-3">
            {(book.rating ?? 0) > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => {
                    const n = i + 1
                    return (book.rating ?? 0) >= n
                      ? <Star key={n} className="w-4.5 h-4.5 fill-warning text-warning" />
                      : (book.rating ?? 0) >= n - 0.5
                      ? <StarHalf key={n} className="w-4.5 h-4.5 fill-warning text-warning" />
                      : <Star key={n} className="w-4.5 h-4.5 text-base-content/18" />
                  })}
                </div>
                <span className="text-xs text-base-content/45 tabular-nums">{book.rating} / 5</span>
              </div>
            )}
            <p className="label-caps">
              Hinzugefügt {new Date(book.dateAdded).toLocaleDateString('de-DE', {
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                       text-sm text-error/70 hover:text-error hover:bg-error/8
                       transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Lösche…' : 'Löschen'}
          </button>

          {isEditing ? (
            <div className="flex gap-2">
              <button onClick={cancelEdit} disabled={isSaving}
                className="btn-bib-ghost">
                Abbrechen
              </button>
              <button onClick={handleSave} disabled={isSaving || isUploadingCover}
                className="btn-bib-primary">
                {isSaving
                  ? <span className="loading loading-spinner loading-xs" />
                  : <><Save className="w-3.5 h-3.5" /> Speichern</>
                }
              </button>
            </div>
          ) : (
            <button onClick={onClose} className="btn-bib-ghost">
              Schließen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
