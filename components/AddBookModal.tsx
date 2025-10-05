// 🎯 PWA-Pattern: Add Book Modal mit Cover Upload & Series
// ✅ TypeScript Strict Mode
// ⚡ Image Compression für Performance
// 📱 Mobile-Optimized File Input

'use client'

import { useState, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Book } from '@/lib/db'
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
  const [assignToSeries, setAssignToSeries] = useState(false)
  const [selectedSeriesId, setSelectedSeriesId] = useState('')
  const [seriesPosition, setSeriesPosition] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load series
  const allSeries = useLiveQuery(() => db.series.toArray())

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate File Type
    if (!file.type.startsWith('image/')) {
      alert('Bitte nur Bilddateien (JPG, PNG, WebP)')
      return
    }

    // Validate File Size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Datei zu groß. Maximum 5MB.')
      return
    }

    setIsLoading(true)
    try {
      // Compress Image
      const compressed = await compressImage(file)
      setCoverBlob(compressed)
      
      // Generate Preview
      const previewUrl = URL.createObjectURL(compressed)
      setCoverPreview(previewUrl)
      setCoverType('upload')
    } catch (error) {
      console.error('Image compression failed:', error)
      alert('Fehler beim Verarbeiten des Bildes')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle URL Input
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

  // Remove Cover
  const removeCover = () => {
    setCoverBlob(null)
    setCoverUrl('')
    setCoverPreview(null)
    setCoverType('none')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Submit Form
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
        seriesId: assignToSeries && selectedSeriesId ? selectedSeriesId : undefined,
        seriesPosition: assignToSeries && selectedSeriesId ? seriesPosition : undefined,
        dateAdded: new Date(),
      }

      await db.books.add(newBook as Book)
      
      // Reset Form
      setTitle('')
      setAuthor('')
      removeCover()
      setStatus('unread')
      setAssignToSeries(false)
      setSelectedSeriesId('')
      setSeriesPosition(1)
      
      onClose()
    } catch (error) {
      console.error('Failed to add book:', error)
      alert('Fehler beim Hinzufügen des Buches')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Neues Buch hinzufügen</h3>
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Titel *</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Der Hobbit"
              required
            />
          </div>

          {/* Author */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Autor *</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="z.B. J.R.R. Tolkien"
              required
            />
          </div>

          {/* Cover Section */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Cover (optional)</span>
            </label>

            {/* Cover Preview */}
            {coverPreview && (
              <div className="mb-3 relative">
                <img
                  src={coverPreview}
                  alt="Cover Preview"
                  className="w-32 h-48 object-cover rounded-lg mx-auto"
                />
                <button
                  type="button"
                  className="btn btn-sm btn-circle btn-error absolute top-2 right-2"
                  onClick={removeCover}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Upload Options */}
            {!coverPreview && (
              <div className="space-y-2">
                {/* File Upload */}
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
                />

                {/* URL Input */}
                <div className="divider text-xs">ODER</div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    className="input input-bordered flex-1 input-sm"
                    placeholder="Cover-URL einfügen"
                    value={coverUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => handleUrlChange(coverUrl)}
                  >
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
              <label className="btn btn-sm flex-1">
                <input
                  type="radio"
                  name="status"
                  className="radio radio-xs mr-2"
                  checked={status === 'unread'}
                  onChange={() => setStatus('unread')}
                />
                Ungelesen
              </label>
              <label className="btn btn-sm flex-1">
                <input
                  type="radio"
                  name="status"
                  className="radio radio-xs mr-2"
                  checked={status === 'reading'}
                  onChange={() => setStatus('reading')}
                />
                Lese ich
              </label>
              <label className="btn btn-sm flex-1">
                <input
                  type="radio"
                  name="status"
                  className="radio radio-xs mr-2"
                  checked={status === 'finished'}
                  onChange={() => setStatus('finished')}
                />
                Gelesen
              </label>
            </div>
          </div>

          {/* Series Assignment (Optional) */}
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
                  {allSeries?.map(series => (
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
                    min="1"
                  />
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !title.trim() || !author.trim()}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  Speichere...
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
