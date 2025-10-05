'use client'

import { useState, useEffect, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Book, updateSeriesRating } from '@/lib/db'
import { X, Upload, Link as LinkIcon } from 'lucide-react'
import { compressImage } from '@/lib/imageUtils'

interface AddBookModalProps {
  isOpen: boolean
  onClose: () => void
  preFill?: { title: string; authors: string; coverUrl: string }
}

export function AddBookModal({ isOpen, onClose, preFill }: AddBookModalProps) {
  const seriesList = useLiveQuery(() => db.series.toArray(), [])

  const [title, setTitle] = useState(preFill?.title || '')
  const [author, setAuthor] = useState(preFill?.authors || '')
  const [coverType, setCoverType] = useState<'none' | 'upload' | 'url'>(preFill ? 'url' : 'none')
  const [coverUrl, setCoverUrl] = useState(preFill?.coverUrl || '')
  const [coverBlob, setCoverBlob] = useState<Blob | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(preFill?.coverUrl || null)
  const [status, setStatus] = useState<'unread' | 'reading' | 'finished'>('unread')
  const [rating, setRating] = useState<number>(0)
  const [assignToSeries, setAssignToSeries] = useState(false)
  const [selectedSeriesId, setSelectedSeriesId] = useState('')
  const [seriesPosition, setSeriesPosition] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (coverPreview && coverType === 'upload') {
        URL.revokeObjectURL(coverPreview)
      }
    }
  }, [coverPreview, coverType])

  useEffect(() => {
    if (isOpen && preFill) {
      setTitle(preFill.title)
      setAuthor(preFill.authors)
      setCoverUrl(preFill.coverUrl)
      setCoverPreview(preFill.coverUrl || null)
      setCoverType(preFill.coverUrl ? 'url' : 'none')
    }
  }, [isOpen, preFill])

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

    setIsLoading(true)
    try {
      const compressed = await compressImage(file)
      setCoverBlob(compressed)
      const previewUrl = URL.createObjectURL(compressed)
      setCoverPreview(previewUrl)
      setCoverType('upload')
    } catch {
      alert('Fehler beim Verarbeiten des Bildes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUrlChange = (url: string) => {
    setCoverUrl(url)
    if (url) {
      setCoverPreview(url)
      setCoverType('url')
    } else {
      setCoverPreview(null)
      setCoverType('none')
    }
  }

  const removeCover = () => {
    setCoverBlob(null)
    setCoverUrl('')
    setCoverPreview(null)
    setCoverType('none')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !author.trim()) {
      alert('Titel und Autor sind Pflichtfelder')
      return
    }
    if (assignToSeries && !selectedSeriesId) {
      alert('Bitte eine Buchreihe auswählen')
      return
    }

    setIsLoading(true)
    try {
      const newBook: Omit<Book, 'id'> = {
        title: title.trim(),
        author: author.trim(),
        coverType,
        coverUrl: coverType === 'url' ? coverUrl : undefined,
        coverBlob: coverType === 'upload' ? coverBlob! : undefined,
        status,
        rating,
        seriesId: assignToSeries ? selectedSeriesId : undefined,
        seriesPosition: assignToSeries ? seriesPosition : undefined,
        dateAdded: new Date(),
      }

      console.log('Speichere Buch mit Daten:', newBook)

      await db.books.add(newBook as Book)

      if (assignToSeries && selectedSeriesId) {
        await updateSeriesRating(selectedSeriesId)
      }

      setTitle('')
      setAuthor('')
      removeCover()
      setStatus('unread')
      setRating(0)
      setAssignToSeries(false)
      setSelectedSeriesId('')
      setSeriesPosition(1)

      onClose()
    } catch {
      alert('Fehler beim Hinzufügen des Buches')
    } finally {
      setIsLoading(false)
    }
  }

  // Sterne Rating UI (vereinfacht)
  const renderStars = () => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(
          <span
            key={i}
            onClick={() => setRating(i)}
            className="cursor-pointer text-yellow-400 text-xl"
            role="button"
            aria-label={`${i} Sterne`}
          >
            ★
          </span>
        )
      } else if (rating >= i - 0.5) {
        stars.push(
          <span
            key={i}
            onClick={() => setRating(i - 0.5)}
            className="cursor-pointer text-yellow-400 text-xl"
            role="button"
            aria-label={`${i - 0.5} Sterne`}
          >
            ☆
          </span>
        )
      } else {
        stars.push(
          <span
            key={i}
            onClick={() => setRating(i)}
            className="cursor-pointer text-gray-300 text-xl"
            role="button"
            aria-label={`0 Sterne`}
          >
            ★
          </span>
        )
      }
    }
    return <div className="flex gap-1">{stars}</div>
  }

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Neues Buch hinzufügen</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose} disabled={isLoading} aria-label="Modal schließen">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Titel */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Titel *</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="z.B. Der Hobbit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          {/* Autor */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Autor *</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="z.B. J.R.R. Tolkien"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Cover Upload */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Cover (optional)</span>
            </label>
            {coverPreview ? (
              <div className="mb-3 relative">
                <img src={coverPreview} alt="Cover Vorschau" className="w-32 h-48 object-cover rounded-lg mx-auto" />
                <button
                  type="button"
                  className="btn btn-sm btn-circle btn-error absolute top-2 right-2"
                  onClick={removeCover}
                  disabled={isLoading}
                  aria-label="Cover entfernen"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  className="btn btn-outline btn-block"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isLoading ? 'Verarbeite...' : 'Bild hochladen'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                />
                <div className="divider text-xs">ODER</div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    className="input input-bordered flex-1 input-sm"
                    placeholder="Cover-URL einfügen"
                    value={coverUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    disabled={isLoading}
                  />
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => handleUrlChange(coverUrl)} disabled={isLoading} aria-label="Cover URL verwenden">
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Status</span>
            </label>
            <div className="flex gap-2">
              {['unread', 'reading', 'finished'].map((s) => (
                <label key={s} className="btn btn-sm flex-1 cursor-pointer" aria-label={`Status ${s}`}>
                  <input
                    type="radio"
                    name="status"
                    className="radio radio-xs mr-2"
                    checked={status === s}
                    onChange={() => setStatus(s as 'unread' | 'reading' | 'finished')}
                    disabled={isLoading}
                  />
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Bewertung */}
          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text">Bewertung</span>
            </label>
            {renderStars()}
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isLoading}>
              Abbrechen
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !title.trim() || !author.trim()}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>Speichere...
                </>
              ) : (
                'Hinzufügen'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  )
}
