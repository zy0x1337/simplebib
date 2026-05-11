'use client'

import { useState, useEffect, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Book, updateSeriesRating } from '@/lib/db'
import { X, Upload, Link as LinkIcon, Star, StarHalf } from 'lucide-react'
import { compressImage } from '@/lib/imageUtils'

interface AddBookModalProps {
  isOpen: boolean
  onClose: () => void
  preFill?: { title: string; authors: string; coverUrl: string }
}

const STATUS_OPTIONS = [
  { value: 'unread',   label: 'Ungelesen' },
  { value: 'reading',  label: 'Lese ich'  },
  { value: 'finished', label: 'Gelesen'   },
] as const

export function AddBookModal({ isOpen, onClose, preFill }: AddBookModalProps) {
  const seriesList = useLiveQuery(() => db.series.toArray(), [])

  const [title, setTitle]               = useState(preFill?.title   || '')
  const [author, setAuthor]             = useState(preFill?.authors || '')
  const [coverType, setCoverType]       = useState<'none'|'upload'|'url'>(preFill ? 'url' : 'none')
  const [coverUrl, setCoverUrl]         = useState(preFill?.coverUrl || '')
  const [coverBlob, setCoverBlob]       = useState<Blob | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(preFill?.coverUrl || null)
  const [status, setStatus]             = useState<'unread'|'reading'|'finished'>('unread')
  const [rating, setRating]             = useState(0)
  const [assignToSeries, setAssignToSeries]   = useState(false)
  const [selectedSeriesId, setSelectedSeriesId] = useState('')
  const [seriesPosition, setSeriesPosition]   = useState(1)
  const [isLoading, setIsLoading]       = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (coverPreview && coverType === 'upload') URL.revokeObjectURL(coverPreview)
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
    if (!file.type.startsWith('image/')) { alert('Nur Bilddateien (JPG, PNG, WebP)'); return }
    if (file.size > 5 * 1024 * 1024)    { alert('Datei zu groß. Max. 5 MB.'); return }
    setIsLoading(true)
    try {
      const compressed = await compressImage(file)
      setCoverBlob(compressed)
      setCoverPreview(URL.createObjectURL(compressed))
      setCoverType('upload')
    } catch { alert('Fehler beim Verarbeiten des Bildes') }
    finally  { setIsLoading(false) }
  }

  const handleUrlChange = (url: string) => {
    setCoverUrl(url)
    setCoverPreview(url || null)
    setCoverType(url ? 'url' : 'none')
  }

  const removeCover = () => {
    setCoverBlob(null)
    setCoverUrl('')
    setCoverPreview(null)
    setCoverType('none')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !author.trim()) { alert('Titel und Autor sind Pflichtfelder'); return }
    if (assignToSeries && !selectedSeriesId) { alert('Bitte eine Buchreihe auswählen'); return }
    setIsLoading(true)
    try {
      const newBook: Omit<Book, 'id'> = {
        title:          title.trim(),
        author:         author.trim(),
        coverType,
        coverUrl:       coverType === 'url'    ? coverUrl    : undefined,
        coverBlob:      coverType === 'upload' ? coverBlob!  : undefined,
        status,
        rating,
        seriesId:       assignToSeries ? selectedSeriesId : undefined,
        seriesPosition: assignToSeries ? seriesPosition   : undefined,
        dateAdded: new Date(),
      }
      await db.books.add(newBook as Book)
      if (assignToSeries && selectedSeriesId) await updateSeriesRating(selectedSeriesId)
      setTitle(''); setAuthor(''); removeCover()
      setStatus('unread'); setRating(0)
      setAssignToSeries(false); setSelectedSeriesId(''); setSeriesPosition(1)
      onClose()
    } catch { alert('Fehler beim Hinzufügen des Buches') }
    finally  { setIsLoading(false) }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-base-content/30 backdrop-blur-sm anim-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="modal-panel relative w-full sm:max-w-md max-h-[92dvh]
                      overflow-y-auto rounded-t-2xl sm:rounded-lg">

        {/* Handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-base-content/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <h2 className="font-display text-lg font-semibold">Neues Buch</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 flex items-center justify-center rounded-md
                       text-base-content/40 hover:text-base-content hover:bg-base-content/6
                       transition-colors"
            aria-label="Schließen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bib-divider mx-5" />

        <form onSubmit={handleSubmit} className="px-5 pt-4 pb-6 flex flex-col gap-4">

          {/* Titel */}
          <div className="flex flex-col gap-1.5">
            <label className="label-caps">Titel *</label>
            <input
              className="bib-input"
              placeholder="z. B. Der Hobbit"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Autor */}
          <div className="flex flex-col gap-1.5">
            <label className="label-caps">Autor *</label>
            <input
              className="bib-input"
              placeholder="z. B. J. R. R. Tolkien"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Cover */}
          <div className="flex flex-col gap-1.5">
            <label className="label-caps">Cover (optional)</label>

            {coverPreview ? (
              <div className="relative w-24 h-36 mx-auto">
                <img
                  src={coverPreview}
                  alt="Cover Vorschau"
                  className="w-full h-full object-cover rounded-lg shadow-md"
                />
                <button
                  type="button"
                  onClick={removeCover}
                  disabled={isLoading}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full
                             bg-base-content text-base-100
                             flex items-center justify-center
                             transition-opacity hover:opacity-80"
                  aria-label="Cover entfernen"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 w-full py-2.5
                             rounded-lg border border-dashed border-base-content/20
                             text-sm text-base-content/50
                             hover:border-base-content/40 hover:text-base-content/70
                             transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {isLoading ? 'Verarbeite…' : 'Bild hochladen'}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*"
                  className="hidden" onChange={handleFileUpload} disabled={isLoading} />

                <div className="flex items-center gap-2 text-xs text-base-content/30">
                  <div className="flex-1 bib-divider" />
                  <span>oder URL</span>
                  <div className="flex-1 bib-divider" />
                </div>

                <div className="relative">
                  <input
                    type="url"
                    className="bib-input pr-10 text-sm"
                    placeholder="https://…"
                    value={coverUrl}
                    onChange={e => handleUrlChange(e.target.value)}
                    disabled={isLoading}
                  />
                  {coverUrl && (
                    <button type="button" onClick={() => handleUrlChange(coverUrl)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2
                                 text-base-content/40 hover:text-base-content/70"
                      aria-label="URL verwenden"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label className="label-caps">Status</label>
            <div className="grid grid-cols-3 gap-1.5">
              {STATUS_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  disabled={isLoading}
                  className={`py-2 rounded-lg text-sm font-medium transition-all duration-150
                    ${ status === value
                      ? 'bg-primary text-primary-content shadow-sm'
                      : 'bg-base-200 text-base-content/60 hover:bg-base-300 hover:text-base-content'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Bewertung */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="label-caps">Bewertung</label>
              <span className="text-xs text-base-content/40 tabular-nums">
                {rating > 0 ? `${rating} / 5` : '—'}
              </span>
            </div>
            <div className="flex gap-1 justify-center py-1">
              {Array.from({ length: 5 }, (_, i) => {
                const n = i + 1
                const filled = rating >= n
                const half   = rating >= n - 0.5 && rating < n
                return filled
                  ? <Star key={n} className="w-7 h-7 fill-warning text-warning cursor-pointer"
                      onClick={() => setRating(n)} />
                  : half
                  ? <StarHalf key={n} className="w-7 h-7 fill-warning text-warning cursor-pointer"
                      onClick={() => setRating(n - 0.5)} />
                  : <Star key={n} className="w-7 h-7 text-base-content/20 cursor-pointer
                                              hover:text-warning/60 transition-colors"
                      onClick={() => setRating(n)} />
              })}
            </div>
            <input type="range" min="0" max="5" step="0.5" value={rating}
              onChange={e => setRating(parseFloat(e.target.value))}
              className="range range-xs range-warning" />
          </div>

          {/* Buchreihe */}
          {seriesList && seriesList.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={assignToSeries}
                  onChange={e => setAssignToSeries(e.target.checked)}
                  className="checkbox checkbox-sm checkbox-primary"
                />
                <span className="label-caps">Buchreihe zuweisen</span>
              </label>

              {assignToSeries && (
                <div className="flex gap-2 anim-fade-in">
                  <select
                    className="bib-input flex-1"
                    value={selectedSeriesId}
                    onChange={e => setSelectedSeriesId(e.target.value)}
                  >
                    <option value="">Reihe wählen…</option>
                    {seriesList.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="bib-input w-20 text-center"
                    placeholder="Band"
                    value={seriesPosition}
                    min={1}
                    onChange={e => setSeriesPosition(parseInt(e.target.value) || 1)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} disabled={isLoading}
              className="btn-bib-ghost flex-1">
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim() || !author.trim()}
              className="btn-bib-primary flex-1"
            >
              {isLoading
                ? <span className="loading loading-spinner loading-xs" />
                : 'Hinzufügen'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
