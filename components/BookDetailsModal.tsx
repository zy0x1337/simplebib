'use client'

import { useState, useRef, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Book, updateSeriesRating } from '@/lib/db'
import { X, Trash2, Edit2, Save, Star, StarHalf, Upload, Link as LinkIcon, Image } from 'lucide-react'
import { compressImage } from '@/lib/imageUtils'

interface BookDetailsModalProps {
  book: Book
  isOpen: boolean
  onClose: () => void
}

export function BookDetailsModal({ book, isOpen, onClose }: BookDetailsModalProps) {
  const [isEditingBook, setIsEditingBook] = useState(false)
  const [editedTitle, setEditedTitle] = useState(book.title)
  const [editedAuthor, setEditedAuthor] = useState(book.author)
  const [editedStatus, setEditedStatus] = useState<'unread' | 'reading' | 'finished'>(book.status)
  const [editedRating, setEditedRating] = useState(book.rating || 0)
  const [editedPosition, setEditedPosition] = useState(book.seriesPosition || 1)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Cover editing states
  const [isEditingCover, setIsEditingCover] = useState(false)
  const [editedCoverType, setEditedCoverType] = useState<'none' | 'upload' | 'url'>(book.coverType)
  const [editedCoverUrl, setEditedCoverUrl] = useState(book.coverUrl || '')
  const [editedCoverBlob, setEditedCoverBlob] = useState<Blob | null>(book.coverBlob || null)
  const [editedCoverPreview, setEditedCoverPreview] = useState<string | null>(null)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const series = useLiveQuery(
    () => book.seriesId ? db.series.get(book.seriesId) : undefined,
    [book.seriesId]
  )

  // Initialize cover preview
  useEffect(() => {
    if (book.coverType === 'upload' && book.coverBlob) {
      setEditedCoverPreview(URL.createObjectURL(book.coverBlob))
    } else if (book.coverType === 'url' && book.coverUrl) {
      setEditedCoverPreview(book.coverUrl)
    }
  }, [book])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Bitte nur Bilddateien (JPG, PNG, WebP)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Datei zu groß. Maximum 5MB.')
      return
    }

    setIsUploadingCover(true)
    try {
      const compressed = await compressImage(file)
      setEditedCoverBlob(compressed)
      const previewUrl = URL.createObjectURL(compressed)
      setEditedCoverPreview(previewUrl)
      setEditedCoverType('upload')
    } catch {
      alert('Fehler beim Verarbeiten des Bildes')
    } finally {
      setIsUploadingCover(false)
    }
  }

  const handleUrlChange = (url: string) => {
    setEditedCoverUrl(url)
    if (url) {
      setEditedCoverPreview(url)
      setEditedCoverType('url')
    } else {
      setEditedCoverPreview(null)
      setEditedCoverType('none')
    }
  }

  const removeCover = () => {
    setEditedCoverBlob(null)
    setEditedCoverUrl('')
    setEditedCoverPreview(null)
    setEditedCoverType('none')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async () => {
    if (!confirm(`"${book.title}" wirklich löschen?`)) return
    setIsDeleting(true)
    try {
      await db.books.delete(book.id!)
      if (book.seriesId) {
        await updateSeriesRating(book.seriesId)
      }
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveBook = async () => {
    if (!editedTitle.trim() || !editedAuthor.trim()) {
      alert('Titel und Autor dürfen nicht leer sein')
      return
    }
    
    setIsSaving(true)
    try {
      await db.books.update(book.id!, {
        title: editedTitle.trim(),
        author: editedAuthor.trim(),
        status: editedStatus,
        rating: editedRating,
        seriesPosition: editedPosition,
        coverType: editedCoverType,
        coverUrl: editedCoverType === 'url' ? editedCoverUrl : undefined,
        coverBlob: editedCoverType === 'upload' ? editedCoverBlob! : undefined,
      })
      if (book.seriesId) {
        await updateSeriesRating(book.seriesId)
      }
      setIsEditingBook(false)
      setIsEditingCover(false)
      // Update local book object
      book.title = editedTitle.trim()
      book.author = editedAuthor.trim()
      book.status = editedStatus
      book.rating = editedRating
      book.seriesPosition = editedPosition
      book.coverType = editedCoverType
      book.coverUrl = editedCoverType === 'url' ? editedCoverUrl : undefined
      book.coverBlob = editedCoverType === 'upload' ? editedCoverBlob! : undefined
    } catch (error) {
      alert('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  // Render Stars (read-only view)
  const renderStarsDisplay = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      const isFilled = rating >= i
      const isHalf = rating >= i - 0.5 && rating < i
      
      if (isFilled) {
        stars.push(<Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)
      } else if (isHalf) {
        stars.push(<StarHalf key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)
      } else {
        stars.push(<Star key={i} className="w-5 h-5 text-gray-300" />)
      }
    }
    return <div className="flex gap-1">{stars}</div>
  }

  // Render Stars (editable with slider)
  const renderStarsEdit = () => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      const isFilled = editedRating >= i
      const isHalf = editedRating >= i - 0.5 && editedRating < i
      
      if (isFilled) {
        stars.push(<Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)
      } else if (isHalf) {
        stars.push(<StarHalf key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)
      } else {
        stars.push(<Star key={i} className="w-5 h-5 text-gray-300" />)
      }
    }
    
    return (
      <div className="space-y-2">
        <div className="flex gap-1">{stars}</div>
        <input
          type="range"
          min="0"
          max="5"
          step="0.5"
          value={editedRating}
          onChange={(e) => setEditedRating(parseFloat(e.target.value))}
          className="range range-xs"
          disabled={isSaving}
        />
        <div className="text-sm text-center">
          {editedRating > 0 ? `${editedRating} / 5` : 'Keine Bewertung'}
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  const coverSrc = editedCoverPreview || (
    book.coverType === 'upload' && book.coverBlob
      ? URL.createObjectURL(book.coverBlob)
      : book.coverType === 'url' && book.coverUrl
      ? book.coverUrl
      : null
  )

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          {isEditingBook ? (
            <div className="flex gap-2 items-center flex-1">
              <h3 className="font-bold text-xl">Buch bearbeiten</h3>
              <button
                className="btn btn-success btn-sm ml-auto"
                onClick={handleSaveBook}
                disabled={isSaving || isUploadingCover}
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setIsEditingBook(false)
                  setIsEditingCover(false)
                  setEditedTitle(book.title)
                  setEditedAuthor(book.author)
                  setEditedStatus(book.status)
                  setEditedRating(book.rating || 0)
                  setEditedPosition(book.seriesPosition || 1)
                  setEditedCoverType(book.coverType)
                  setEditedCoverUrl(book.coverUrl || '')
                  setEditedCoverBlob(book.coverBlob || null)
                }}
                disabled={isSaving || isUploadingCover}
              >
                Abbrechen
              </button>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-xl">{book.title}</h3>
              <div className="flex gap-2">
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setIsEditingBook(true)}
                  aria-label="Bearbeiten"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose} aria-label="Schließen">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Cover Section */}
          <div className="flex-shrink-0">
            {coverSrc ? (
              <div className="relative">
                <img src={coverSrc} alt={book.title} className="w-48 h-64 object-cover rounded-lg shadow-lg" />
                {isEditingBook && (
                  <button
                    className="btn btn-sm btn-circle btn-error absolute top-2 right-2"
                    onClick={removeCover}
                    disabled={isSaving}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : isEditingBook ? (
              <div className="w-48 h-64 bg-base-200 rounded-lg flex flex-col items-center justify-center gap-3 p-4">
                <Image className="w-12 h-12 text-base-content/40" />
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingCover || isSaving}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploadingCover ? 'Lädt...' : 'Hochladen'}
                </button>
                <div className="divider text-xs">ODER</div>
                <input
                  type="url"
                  className="input input-bordered input-sm w-full"
                  placeholder="Cover-URL"
                  value={editedCoverUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  disabled={isSaving}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploadingCover || isSaving}
                />
              </div>
            ) : (
              <div className="w-48 h-64 bg-base-200 rounded-lg flex items-center justify-center">
                <Image className="w-12 h-12 text-base-content/40" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            {/* Titel */}
            <div>
              <p className="text-sm text-base-content/60 mb-1">Titel</p>
              {isEditingBook ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="input input-bordered w-full"
                  disabled={isSaving}
                />
              ) : (
                <p className="font-semibold">{book.title}</p>
              )}
            </div>

            {/* Autor */}
            <div>
              <p className="text-sm text-base-content/60 mb-1">Autor</p>
              {isEditingBook ? (
                <input
                  type="text"
                  value={editedAuthor}
                  onChange={(e) => setEditedAuthor(e.target.value)}
                  className="input input-bordered w-full"
                  disabled={isSaving}
                />
              ) : (
                <p className="font-semibold">{book.author}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <p className="text-sm text-base-content/60 mb-1">Status</p>
              {isEditingBook ? (
                <div className="flex gap-2">
                  {(['unread', 'reading', 'finished'] as const).map((s) => (
                    <label key={s} className="btn btn-sm flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="status-edit"
                        className="radio radio-xs mr-2"
                        checked={editedStatus === s}
                        onChange={() => setEditedStatus(s)}
                        disabled={isSaving}
                      />
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </label>
                  ))}
                </div>
              ) : (
                <p className="capitalize font-semibold">{book.status}</p>
              )}
            </div>

            {/* Bewertung */}
            <div>
              <p className="text-sm text-base-content/60 mb-1">Bewertung</p>
              {isEditingBook ? (
                renderStarsEdit()
              ) : (
                (book.rating ?? 0) > 0 ? renderStarsDisplay(book.rating ?? 0) : <p className="text-sm text-gray-500">Keine Bewertung</p>
              )}
            </div>

            {/* Buchreihe */}
            {series && (
              <div>
                <p className="text-sm text-base-content/60">Buchreihe</p>
                <p className="font-semibold">{series.name}</p>
              </div>
            )}

            {/* Bandnummer */}
            {book.seriesId && (
              <div>
                <p className="text-sm text-base-content/60 mb-1">Bandnummer</p>
                {isEditingBook ? (
                  <input
                    type="number"
                    min="1"
                    value={editedPosition}
                    onChange={(e) => setEditedPosition(parseInt(e.target.value) || 1)}
                    className="input input-bordered w-32"
                    disabled={isSaving}
                  />
                ) : (
                  <p className="font-semibold">Band {book.seriesPosition || '?'}</p>
                )}
              </div>
            )}

            {/* Hinzugefügt am */}
            <div>
              <p className="text-sm text-base-content/60">Hinzugefügt am</p>
              <p>{new Date(book.dateAdded).toLocaleDateString('de-DE')}</p>
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button
            className="btn btn-error"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? 'Löscht...' : 'Löschen'}
          </button>
          <button className="btn" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  )
}
