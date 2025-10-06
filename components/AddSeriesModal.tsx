// 🎯 PWA-Pattern: Add Series Modal
// ✅ TypeScript Strict Mode
// 📱 Einfache Serie-Erstellung

'use client'

import { useState } from 'react'
import { db, Series } from '@/lib/db'
import { X } from 'lucide-react'

interface AddSeriesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddSeriesModal({ isOpen, onClose }: AddSeriesModalProps) {
  const [name, setName] = useState('')
  const [totalBooks, setTotalBooks] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      alert('Name ist ein Pflichtfeld')
      return
    }

    setIsLoading(true)
    try {
      const newSeries: Omit<Series, 'id'> = {
        name: name.trim(),
        totalBooks,
        dateCreated: new Date(),
      }

      await db.series.add(newSeries as Series)
      
      // Reset Form
      setName('')
      setTotalBooks(1)
      
      onClose()
    } catch (error) {
      console.error('Failed to add series:', error)
      alert('Fehler beim Erstellen der Buchreihe')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Neue Buchreihe erstellen</h3>
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
          {/* Series Name */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Name der Buchreihe *</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Herr der Ringe"
              required
            />
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
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  Erstelle...
                </>
              ) : (
                'Erstellen'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  )
}
