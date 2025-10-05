// 🎯 PWA-Pattern: Series Details mit Büchern
// ✅ TypeScript Strict Mode
// 📱 Manage books in series

'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Series } from '@/lib/db'
import { X, Plus, Trash2, BookOpen } from 'lucide-react'
import { BookCard } from './BookCard'
import { AddBookToSeriesModal } from './AddBookToSeriesModal'

interface SeriesDetailsModalProps {
  series: Series
  isOpen: boolean
  onClose: () => void
}

export function SeriesDetailsModal({ series, isOpen, onClose }: SeriesDetailsModalProps) {
  const [isAddBookOpen, setIsAddBookOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Get books in series, sorted by position
  const booksInSeries = useLiveQuery(
    () => db.books
      .where('seriesId')
      .equals(series.id!)
      .toArray()
      .then(books => books.sort((a, b) => (a.seriesPosition || 0) - (b.seriesPosition || 0))),
    [series.id]
  )

  // Delete Series
  const handleDelete = async () => {
    if (!confirm(`Buchreihe "${series.name}" wirklich löschen?\n\nDie Bücher bleiben erhalten, werden aber aus der Serie entfernt.`)) {
      return
    }

    setIsDeleting(true)
    try {
      // Remove series reference from all books
      const books = await db.books.where('seriesId').equals(series.id!).toArray()
      for (const book of books) {
        await db.books.update(book.id!, { seriesId: undefined, seriesPosition: undefined })
      }

      // Delete series
      await db.series.delete(series.id!)
      onClose()
    } catch (error) {
      console.error('Failed to delete series:', error)
      alert('Fehler beim Löschen der Buchreihe')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="modal modal-open">
        <div className="modal-box max-w-2xl">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-xl pr-8">{series.name}</h3>
              <p className="text-sm text-base-content/60 mt-1">
                {booksInSeries?.length || 0} Bücher in dieser Reihe
              </p>
            </div>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Books Grid */}
          <div className="mb-6">
            {!booksInSeries || booksInSeries.length === 0 ? (
              <div className="text-center py-12 text-base-content/60">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Noch keine Bücher in dieser Reihe</p>
                <button
                  className="btn btn-sm btn-primary mt-4"
                  onClick={() => setIsAddBookOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Erstes Buch hinzufügen
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                  {booksInSeries.map((book) => (
                    <div key={book.id} className="relative">
                      {book.seriesPosition && (
                        <div className="absolute top-2 left-2 z-10 badge badge-sm badge-primary">
                          Band {book.seriesPosition}
                        </div>
                      )}
                      <BookCard book={book} viewMode="grid" />
                    </div>
                  ))}
                </div>
                <button
                  className="btn btn-sm btn-outline btn-block"
                  onClick={() => setIsAddBookOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Weiteres Buch hinzufügen
                </button>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="modal-action">
            <button
              className="btn btn-error btn-outline btn-sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  Lösche...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Serie löschen
                </>
              )}
            </button>
            <button className="btn btn-sm" onClick={onClose}>
              Schließen
            </button>
          </div>
        </div>
        <div className="modal-backdrop" onClick={onClose}></div>
      </div>

      <AddBookToSeriesModal
        series={series}
        isOpen={isAddBookOpen}
        onClose={() => setIsAddBookOpen(false)}
      />
    </>
  )
}
