'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
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
  { value: 'unread',   label: 'Ungelesen',
    bg: 'var(--color-surface-2)', color: 'var(--color-text-muted)',
    activeBg: 'oklch(from var(--color-unread) l c h / 0.18)', activeColor: 'var(--color-text)' },
  { value: 'reading',  label: 'Lese ich',
    bg: 'var(--color-surface-2)', color: 'var(--color-text-muted)',
    activeBg: 'var(--color-reading-muted)', activeColor: 'var(--color-reading)' },
  { value: 'finished', label: 'Gelesen',
    bg: 'var(--color-surface-2)', color: 'var(--color-text-muted)',
    activeBg: 'var(--color-accent-muted)', activeColor: 'var(--color-accent)' },
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
  const [hoverRating, setHoverRating]   = useState(0)
  const [assignToSeries, setAssignToSeries]     = useState(false)
  const [selectedSeriesId, setSelectedSeriesId] = useState('')
  const [seriesPosition, setSeriesPosition]     = useState(1)
  const [isLoading, setIsLoading]       = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [mounted, setMounted]           = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setMounted(true) }, [])

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
    if (isOpen) setError(null)
  }, [isOpen, preFill])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Nur Bilddateien (JPG, PNG, WebP)'); return }
    if (file.size > 5 * 1024 * 1024)    { setError('Datei zu groß. Max. 5 MB.'); return }
    setIsLoading(true)
    setError(null)
    try {
      const compressed = await compressImage(file)
      setCoverBlob(compressed)
      setCoverPreview(URL.createObjectURL(compressed))
      setCoverType('upload')
    } catch { setError('Fehler beim Verarbeiten des Bildes') }
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

  const resetForm = () => {
    setTitle(''); setAuthor(''); removeCover()
    setStatus('unread'); setRating(0); setHoverRating(0)
    setAssignToSeries(false); setSelectedSeriesId(''); setSeriesPosition(1)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!title.trim() || !author.trim()) { setError('Titel und Autor sind Pflichtfelder'); return }
    if (assignToSeries && !selectedSeriesId) { setError('Bitte eine Buchreihe auswählen'); return }
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
      resetForm()
      onClose()
    } catch { setError('Fehler beim Hinzufügen des Buches') }
    finally  { setIsLoading(false) }
  }

  const displayRating = hoverRating || rating

  if (!mounted) return null

  return createPortal(
    isOpen ? (
      <div className="modal-overlay anim-fade-in" onClick={onClose}>
        <div
          className="modal-box anim-modal-in"
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-book-title"
        >
          {/* Drag handle */}
          <div className="modal-box__handle">
            <div className="modal-box__handle-bar" />
          </div>

          {/* Header */}
          <div className="modal-box__header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2
                id="add-book-title"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-xl)',
                  fontWeight: 400,
                  fontStyle: 'italic',
                  letterSpacing: 'var(--tracking-tight)',
                  color: 'var(--color-text)',
                }}
              >
                Neues Buch
              </h2>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="btn btn-icon btn-ghost"
                aria-label="Schließen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="modal-box__divider" />

          {/* Scrollable body */}
          <div className="modal-box__body">
            <form
              id="add-book-form"
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
            >
              {/* Inline error */}
              {error && (
                <div
                  className="anim-fade-in"
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    background: 'oklch(from var(--color-error) l c h / 0.12)',
                    color: 'var(--color-error)',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  {error}
                </div>
              )}

              {/* Titel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <label style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  letterSpacing: 'var(--tracking-widest)',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                }}>
                  Titel *
                </label>
                <input
                  className="input"
                  placeholder="z. B. Der Hobbit"
                  value={title}
                  onChange={e => { setTitle(e.target.value); setError(null) }}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Autor */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <label style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  letterSpacing: 'var(--tracking-widest)',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                }}>
                  Autor *
                </label>
                <input
                  className="input"
                  placeholder="z. B. J. R. R. Tolkien"
                  value={author}
                  onChange={e => { setAuthor(e.target.value); setError(null) }}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Cover */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <label style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  letterSpacing: 'var(--tracking-widest)',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                }}>
                  Cover <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                </label>

                {coverPreview ? (
                  <div style={{ position: 'relative', width: '6rem', margin: '0 auto' }}>
                    <img
                      src={coverPreview}
                      alt="Cover Vorschau"
                      style={{
                        width: '6rem',
                        aspectRatio: '2/3',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-book)',
                        display: 'block',
                      }}
                    />
                    <button
                      type="button"
                      onClick={removeCover}
                      disabled={isLoading}
                      style={{
                        position: 'absolute', top: '-0.5rem', right: '-0.5rem',
                        width: '1.5rem', height: '1.5rem',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--color-text)',
                        color: 'var(--color-bg)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: 'none', cursor: 'pointer',
                      }}
                      aria-label="Cover entfernen"
                    >
                      <X style={{ width: '0.75rem', height: '0.75rem' }} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 'var(--space-2)',
                        width: '100%',
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px dashed var(--color-border)',
                        background: 'transparent',
                        color: 'var(--color-text-faint)',
                        fontSize: 'var(--text-sm)',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'border-color var(--transition), color var(--transition)',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-text-muted)'
                        ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'
                        ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-faint)'
                      }}
                    >
                      <Upload style={{ width: '1rem', height: '1rem' }} />
                      {isLoading ? 'Verarbeite…' : 'Bild hochladen'}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*"
                      style={{ display: 'none' }} onChange={handleFileUpload} disabled={isLoading} />

                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                      fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)',
                    }}>
                      <div style={{ flex: 1, height: '1px', background: 'var(--color-divider)' }} />
                      <span>oder URL</span>
                      <div style={{ flex: 1, height: '1px', background: 'var(--color-divider)' }} />
                    </div>

                    <div style={{ position: 'relative' }}>
                      <input
                        type="url"
                        className="input"
                        style={{ paddingRight: coverUrl ? '2.5rem' : undefined, fontSize: 'var(--text-sm)' }}
                        placeholder="https://…"
                        value={coverUrl}
                        onChange={e => handleUrlChange(e.target.value)}
                        disabled={isLoading}
                      />
                      {coverUrl && (
                        <button
                          type="button"
                          onClick={() => handleUrlChange(coverUrl)}
                          disabled={isLoading}
                          style={{
                            position: 'absolute', right: '0.75rem',
                            top: '50%', transform: 'translateY(-50%)',
                            color: 'var(--color-text-faint)',
                            background: 'none', border: 'none', cursor: 'pointer',
                          }}
                          aria-label="URL verwenden"
                        >
                          <LinkIcon style={{ width: '0.875rem', height: '0.875rem' }} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <label style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  letterSpacing: 'var(--tracking-widest)',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                }}>
                  Status
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-1)' }}>
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStatus(opt.value)}
                      disabled={isLoading}
                      style={{
                        padding: 'var(--space-2)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid',
                        borderColor: status === opt.value ? 'transparent' : 'var(--color-border)',
                        background: status === opt.value ? opt.activeBg : 'transparent',
                        color: status === opt.value ? opt.activeColor : 'var(--color-text-muted)',
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 500,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'all var(--transition)',
                        letterSpacing: 'var(--tracking-wide)',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bewertung */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    letterSpacing: 'var(--tracking-widest)',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                  }}>
                    Bewertung
                  </label>
                  <span style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-faint)',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {rating > 0 ? `${rating} / 5` : '—'}
                  </span>
                </div>

                <div
                  style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'center', padding: 'var(--space-1) 0' }}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {/* Inline half-fill SVG def for stars */}
                  <svg width="0" height="0" aria-hidden="true">
                    <defs>
                      <linearGradient id="half-fill">
                        <stop offset="50%" stopColor="var(--color-star)" />
                        <stop offset="50%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {Array.from({ length: 5 }, (_, i) => {
                    const full = i + 1
                    const half = i + 0.5
                    const filled = displayRating >= full
                    const halfFilled = !filled && displayRating >= half
                    return (
                      <div key={i} style={{ position: 'relative', width: '1.5rem', height: '1.5rem' }}>
                        {/* Left half → half star */}
                        <button
                          type="button" disabled={isLoading}
                          onClick={() => setRating(r => r === half ? 0 : half)}
                          onMouseEnter={() => setHoverRating(half)}
                          style={{
                            position: 'absolute', left: 0, top: 0, bottom: 0,
                            width: '50%', background: 'none', border: 'none',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            padding: 0, zIndex: 1,
                          }}
                          aria-label={`${half} Sterne`}
                        />
                        {/* Right half → full star */}
                        <button
                          type="button" disabled={isLoading}
                          onClick={() => setRating(r => r === full ? 0 : full)}
                          onMouseEnter={() => setHoverRating(full)}
                          style={{
                            position: 'absolute', right: 0, top: 0, bottom: 0,
                            width: '50%', background: 'none', border: 'none',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            padding: 0, zIndex: 1,
                          }}
                          aria-label={`${full} Sterne`}
                        />
                        {halfFilled ? (
                          <StarHalf style={{
                            width: '1.5rem', height: '1.5rem',
                            fill: 'var(--color-star)', color: 'var(--color-star)',
                            pointerEvents: 'none',
                            transition: 'transform var(--transition)',
                          }} />
                        ) : (
                          <Star style={{
                            width: '1.5rem', height: '1.5rem',
                            fill: filled ? 'var(--color-star)' : 'none',
                            color: filled ? 'var(--color-star)' : 'var(--color-text-faint)',
                            pointerEvents: 'none',
                            transition: 'fill var(--transition), color var(--transition)',
                          }} />
                        )}
                      </div>
                    )
                  })}
                  {displayRating > 0 && (
                    <button type="button" onClick={() => setRating(0)}
                      style={{
                        marginLeft: 'var(--space-1)', fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-faint)', background: 'none',
                        border: 'none', cursor: 'pointer',
                        padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)',
                      }}>
                      zurücksetzen
                    </button>
                  )}
                </div>

                <input
                  type="range" min="0" max="5" step="0.5" value={rating}
                  onChange={e => setRating(parseFloat(e.target.value))}
                  className="bib-range"
                  disabled={isLoading}
                />
              </div>

              {/* Buchreihe */}
              {seriesList && seriesList.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                    cursor: 'pointer',
                  }}>
                    <span
                      role="checkbox"
                      aria-checked={assignToSeries}
                      tabIndex={0}
                      onClick={() => setAssignToSeries(v => !v)}
                      onKeyDown={e => e.key === ' ' && setAssignToSeries(v => !v)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '1.125rem', height: '1.125rem',
                        borderRadius: 'var(--radius-sm)',
                        border: `2px solid ${assignToSeries ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        background: assignToSeries ? 'var(--color-accent)' : 'transparent',
                        flexShrink: 0,
                        transition: 'all var(--transition)',
                        cursor: 'pointer',
                      }}
                    >
                      {assignToSeries && (
                        <svg viewBox="0 0 10 8" style={{ width: '0.6rem', fill: 'none', stroke: 'var(--color-bg)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                          <polyline points="1,4 4,7 9,1" />
                        </svg>
                      )}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      letterSpacing: 'var(--tracking-widest)',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-muted)',
                    }}>
                      Buchreihe zuweisen
                    </span>
                  </label>

                  {assignToSeries && (
                    <div className="anim-fade-in" style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <select
                        className="input"
                        style={{ flex: 1 }}
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
                        className="input"
                        style={{ width: '5rem', textAlign: 'center' }}
                        placeholder="Band"
                        value={seriesPosition}
                        min={1}
                        onChange={e => setSeriesPosition(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Sticky footer with action buttons */}
          <div className="modal-box__footer">
            <button
              type="button"
              form="add-book-form"
              onClick={onClose}
              disabled={isLoading}
              className="btn btn-ghost"
              style={{ flex: 1 }}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              form="add-book-form"
              disabled={isLoading || !title.trim() || !author.trim()}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {isLoading ? (
                <span
                  style={{
                    display: 'inline-block',
                    width: '1rem', height: '1rem',
                    border: '2px solid var(--color-text-inverse)',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }}
                  aria-label="Lädt…"
                />
              ) : 'Hinzufügen'}
            </button>
          </div>
        </div>
      </div>
    ) : null,
    document.body
  )
}
