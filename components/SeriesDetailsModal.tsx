'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Series, Book } from '@/lib/db'
import { X, Plus, Trash2, BookOpen, Star, StarHalf } from 'lucide-react'
import { AddBookToSeriesModal } from './AddBookToSeriesModal'
import { BookDetailsModal } from './BookDetailsModal'

interface SeriesDetailsModalProps {
  series: Series
  isOpen: boolean
  onClose: () => void
}

export function SeriesDetailsModal({ series, isOpen, onClose }: SeriesDetailsModalProps) {
  const [isAddBookOpen, setIsAddBookOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)

  // Get books in series, sorted by position
  const booksInSeries = useLiveQuery(
    () =>
      db.books
        .where('seriesId')
        .equals(series.id!)
        .toArray()
        .then((books) => books.sort((a, b) => (a.seriesPosition || 0) - (b.seriesPosition || 0))),
    [series.id]
  )

  // Render Stars
  const renderStars = (rating?: number) => {
    if (!rating) return null
    const stars = []
    for (let i = 1; i <= 5; i++) {
      const isFilled = rating >= i
      const isHalf = rating >= i - 0.5 && rating < i
      
      if (isFilled) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
      } else if (isHalf) {
        stars.push(<StarHalf key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />)
      }
    }
    return <div className="flex gap-0.5">{stars}</div>
  }

  // Get status badge
  const getStatusBadge = (status: 'unread' | 'reading' | 'finished') => {
    const badges = {
      unread: <span className="badge badge-ghost badge-sm">Ungelesen</span>,
      reading: <span className="badge badge-info badge-sm">Lese ich</span>,
      finished: <span className="badge badge-success badge-sm">Gelesen</span>,
    }
    return badges[status]
  }

  // Delete Series
  const handleDelete = async () => {
    if (
      !confirm(
        `Buchreihe "${series.name}" wirklich löschen?\n\nDie Bücher bleiben erhalten, werden aber aus der Serie entfernt.`
      )
    ) {
      return
    }

    setIsDeleting(true)
    try {
      const books = await db.books.where('seriesId').equals(series.id!).toArray()
      for (const book of books) {
        await db.books.update(book.id!, {
          seriesId: undefined,
          seriesPosition: undefined,
        })
      }
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
        <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-2xl">{series.name}</h3>
              <div className="flex items-center gap-3 mt-2 text-sm text-base-content/60">
                <span>{booksInSeries?.length || 0} {booksInSeries?.length === 1 ? 'Buch' : 'Bücher'}</span>
                {series.overallRating && series.overallRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-base-content">{series.overallRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={onClose}
              aria-label="Modal schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Books List */}
          {booksInSeries && booksInSeries.length > 0 ? (
            <div className="space-y-2">
              {booksInSeries.map((book) => (
                <div
                  key={book.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-base-200 cursor-pointer transition-colors"
                  onClick={() => setSelectedBook(book)}
                >
                  {/* Position Badge */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {book.seriesPosition}
                  </div>

                  {/* Cover Thumbnail */}
                  <div className="flex-shrink-0 w-12 h-16 rounded overflow-hidden bg-base-300">
                    {book.coverType === 'upload' && book.coverBlob ? (
                      <img
                        src={URL.createObjectURL(book.coverBlob)}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : book.coverType === 'url' && book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-base-content/20" />
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{book.title}</h4>
                    <p className="text-xs text-base-content/60 truncate">{book.author}</p>
                    {book.rating && book.rating > 0 && (
                      <div className="mt-1">{renderStars(book.rating)}</div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    {getStatusBadge(book.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-base-content/20 mb-4" />
              <p className="text-base-content/60">Noch keine Bücher in dieser Reihe</p>
            </div>
          )}

          {/* Actions */}
          <div className="modal-action">
            <button
              className="btn btn-error"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? 'Löscht...' : 'Reihe löschen'}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setIsAddBookOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Buch hinzufügen
            </button>
            <button className="btn" onClick={onClose}>
              Schließen
            </button>
          </div>
        </div>
        <div className="modal-backdrop" onClick={onClose}></div>
      </div>

      {/* Add Book to Series Modal */}
      {isAddBookOpen && (
        <AddBookToSeriesModal
          series={series}
          isOpen={isAddBookOpen}
          onClose={() => setIsAddBookOpen(false)}
        />
      )}

      {/* Book Details Modal */}
      {selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          isOpen={true}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </>
  )
}
