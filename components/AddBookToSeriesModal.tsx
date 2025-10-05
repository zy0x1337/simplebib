// 🎯 PWA-Pattern: Add existing book to series
// ✅ TypeScript Strict Mode
// 📱 Select from library

'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Series, Book } from '@/lib/db'
import { X, Search } from 'lucide-react'

interface AddBookToSeriesModalProps {
  series: Series
  isOpen: boolean
  onClose: () => void
}

export function AddBookToSeriesModal({ series, isOpen, onClose }: AddBookToSeriesModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [position, setPosition] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(false)

  // Get available books (not in any series or in current series)
  const availableBooks = useLiveQuery(
    () => db.books.toArray().then(books => 
      books.filter(book => 
        !book.seriesId || book.seriesId === series.id
      )
    ),
    []
  )

  // Filter by search
  const filteredBooks = availableBooks?.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get next available position
  const nextPosition = useLiveQuery(
    async () => {
      const booksInSeries = await db.books.where('seriesId').equals(series.id!).toArray()
      const positions = booksInSeries.map(b => b.seriesPosition || 0)
      return positions.length > 0 ? Math.max(...positions) + 1 : 1
    },
    [series.id]
  )

  const handleSubmit = async () => {
    if (!selectedBookId) {
      alert('Bitte wähle ein Buch aus')
      return
    }

    setIsLoading(true)
    try {
      await db.books.update(selectedBookId, {
        seriesId: series.id,
        seriesPosition: position,
      })

      // Reset
      setSelectedBookId(null)
      setSearchQuery('')
      setPosition(nextPosition || 1)
      
      onClose()
    } catch (error) {
      console.error('Failed to add book to series:', error)
      alert('Fehler beim Hinzufügen')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Buch zu "{series.name}" hinzufügen</h3>
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="form-control mb-4">
          <div className="input-group">
            <span>
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Buch suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Book List */}
        <div className="mb-4 max-h-64 overflow-y-auto border border-base-300 rounded-lg">
          {!filteredBooks || filteredBooks.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              {searchQuery ? 'Keine passenden Bücher gefunden' : 'Keine Bücher verfügbar'}
            </div>
          ) : (
            <div className="divide-y divide-base-300">
              {filteredBooks.map((book) => (
                <label
                  key={book.id}
                  className="flex items-center gap-3 p-3 hover:bg-base-200 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="book"
                    className="radio radio-primary"
                    checked={selectedBookId === book.id}
                    onChange={() => {
                      setSelectedBookId(book.id!)
                      // Auto-set position if book already in series
                      if (book.seriesId === series.id && book.seriesPosition) {
                        setPosition(book.seriesPosition)
                      } else {
                        setPosition(nextPosition || 1)
                      }
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{book.title}</p>
                    <p className="text-sm text-base-content/60">{book.author}</p>
                    {book.seriesId === series.id && (
                      <span className="badge badge-xs badge-primary mt-1">
                        Band {book.seriesPosition}
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Position Input */}
        {selectedBookId && (
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Band-Nummer</span>
            </label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={position}
              onChange={(e) => setPosition(parseInt(e.target.value) || 1)}
              min="1"
            />
          </div>
        )}

        {/* Actions */}
        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Abbrechen
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isLoading || !selectedBookId}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                Füge hinzu...
              </>
            ) : (
              'Hinzufügen'
            )}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  )
}
