'use client'

import { useState } from 'react'
import { db, Series } from '@/lib/db'
import { X, BookMarked } from 'lucide-react'

interface AddSeriesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddSeriesModal({ isOpen, onClose }: AddSeriesModalProps) {
  const [name, setName]         = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setIsLoading(true)
    try {
      const newSeries: Omit<Series, 'id'> = {
        name:        name.trim(),
        totalBooks:  0,
        dateCreated: new Date(),
      }
      await db.series.add(newSeries as Series)
      setName('')
      onClose()
    } catch {
      alert('Fehler beim Erstellen der Buchreihe')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay anim-fade-in" onClick={onClose}>
      <div
        className="modal-box anim-modal-in"
        style={{ maxWidth: '400px' }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-series-title"
      >
        {/* Drag handle */}
        <div className="modal-box__handle">
          <div className="modal-box__handle-bar" />
        </div>

        {/* Header */}
        <div className="modal-box__header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <BookMarked style={{ width: '1rem', height: '1rem', color: 'var(--color-accent)' }} />
              <h2 id="add-series-title" style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-xl)',
                fontWeight: 400,
                fontStyle: 'italic',
                letterSpacing: 'var(--tracking-tight)',
                color: 'var(--color-text)',
              }}>
                Neue Buchreihe
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="btn btn-icon btn-ghost"
              aria-label="Schließen"
            >
              <X style={{ width: '1rem', height: '1rem' }} />
            </button>
          </div>
        </div>

        <div className="modal-box__divider" />

        <div className="modal-box__body">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <label className="label-caps">Name der Reihe *</label>
              <input
                className="bib-input"
                placeholder="z. B. Herr der Ringe"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
                disabled={isLoading}
              />
            </div>
          </form>
        </div>

        <div className="modal-box__footer">
          <button type="button" onClick={onClose} disabled={isLoading}
            className="btn btn-ghost" style={{ flex: 1 }}>
            Abbrechen
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !name.trim()}
            className="btn btn-primary" style={{ flex: 1 }}
          >
            {isLoading ? (
              <span style={{
                display: 'inline-block', width: '1rem', height: '1rem',
                border: '2px solid var(--color-text-inverse)',
                borderTopColor: 'transparent', borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
              }} aria-label="Lädt…" />
            ) : 'Erstellen'}
          </button>
        </div>
      </div>
    </div>
  )
}
