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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-base-content/30 backdrop-blur-sm anim-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="modal-panel relative w-full sm:max-w-sm
                      rounded-t-2xl sm:rounded-lg">

        {/* Handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-base-content/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex items-center gap-2.5">
            <BookMarked className="w-4 h-4 text-primary" />
            <h2 className="font-display text-lg font-semibold">Neue Buchreihe</h2>
          </div>
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

          <div className="flex flex-col gap-1.5">
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

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} disabled={isLoading}
              className="btn-bib-ghost flex-1">
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="btn-bib-primary flex-1"
            >
              {isLoading
                ? <span className="loading loading-spinner loading-xs" />
                : 'Erstellen'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
