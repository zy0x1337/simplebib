'use client'

import { useState, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Book, updateSeriesRating } from '@/lib/db'
import { X, Upload, Link as LinkIcon } from 'lucide-react'
import { compressImage } from '@/lib/imageUtils'

interface AddBookModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddBookModal({ isOpen, onClose }: AddBookModalProps) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [coverType, setCoverType] = useState<'none' | 'upload' | 'url'>('none')
  const [coverUrl, setCoverUrl] = useState('')
  const [coverBlob, setCoverBlob] = useState<Blob | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<'unread' | 'reading' | 'finished'>('unread')
  const [rating, setRating] = useState<number>(0)
  const [assignToSeries, setAssignToSeries] = useState(false)
  const [selectedSeriesId, setSelectedSeriesId] = useState('')
  const [seriesPosition, setSeriesPosition] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allSeries = useLiveQuery(() => db.series.toArray())

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
        seriesId: assignToSeries && selectedSeriesId ? selectedSeriesId : undefined,
        seriesPosition: assignToSeries && selectedSeriesId ? seriesPosition : undefined,
        dateAdded: new Date(),
      }

      const id = await db.books.add(newBook as Book)

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

  if (!isOpen) return null

  // Sterne Rating UI
  const renderStars = () => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(
          <StarFilled key={i} onClick={() => setRating(i)} />
        )
      } else if (rating >= i - 0.5) {
        stars.push(
          <StarHalf key={i} onClick={() => setRating(i - 0.5)} />
        )
      } else {
        stars.push(
          <StarEmpty key={i} onClick={() => setRating(i - 0.5)} />
        )
      }
    }
    return <div className="flex gap-1 cursor-pointer">{stars}</div>
  }

  // Stern Icons (einfache Komponenten)
  const StarFilled = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="#fbbf24" width={24} height={24} xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer' }}>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  )
  const StarHalf = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="#fbbf24" width={24} height={24} xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer' }}>
      <path d="M12 15.4l-3.76 2.27 1-4.28L5.47 10.5l4.38-.38L12 6v9.4z" />
    </svg>
  )
  const StarEmpty = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth={2} width={24} height={24} xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer' }}>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  )

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Neues Buch hinzufügen</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose} disabled={isLoading}>
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
            />
          </div>

          {/* Cover Upload */}
          <div className="form-control mb-4">
            <label className="label"><span className="label-text">Cover (optional)</span></label>
            {coverPreview ? (
              <div className="mb-3 relative">
                <img src={coverPreview} alt="Cover Vorschau" className="w-32 h-48 object-cover rounded-lg mx-auto" />
                <button
                  type="button"
                  className="btn btn-sm btn-circle btn-error absolute top-2 right-2"
                  onClick={removeCover}
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
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                <div className="divider text-xs">ODER</div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    className="input input-bordered flex-1 input-sm"
                    placeholder="Cover-URL einfügen"
                    value={coverUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                  />
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => handleUrlChange(coverUrl)}>
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
                <label key={s} className="btn btn-sm flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    className="radio radio-xs mr-2"
                    checked={status === s}
                    onChange={() => setStatus(s as 'unread' | 'reading' | 'finished')}
                  />
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text">Bewertung</span>
            </label>
            {renderStars()}
          </div>

          {/* Serie Zuweisen */}
          <div className="form-control mb-6">
            <label className="label cursor-pointer">
              <span className="label-text">Teil einer Buchreihe?</span>
              <input
                type="checkbox"
                className="toggle"
                checked={assignToSeries}
                onChange={(e) => setAssignToSeries(e.target.checked)}
              />
            </label>
            {assignToSeries && (
              <div className="mt-3 space-y-3">
                <select
                  className="select select-bordered w-full"
                  value={selectedSeriesId}
                  onChange={(e) => setSelectedSeriesId(e.target.value)}
                >
                  <option value="">Buchreihe wählen...</option>
                  {allSeries?.map((series) => (
                    <option key={series.id} value={series.id}>
                      {series.name}
                    </option>
                  ))}
                </select>
                {selectedSeriesId && (
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    placeholder="Band-Nummer"
                    value={seriesPosition}
                    onChange={(e) => setSeriesPosition(parseInt(e.target.value) || 1)}
                    min={1}
                  />
                )}
              </div>
            )}
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
