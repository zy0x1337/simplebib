'use client'

import { useState, useEffect } from 'react'
import { db, Book, updateSeriesRating } from '@/lib/db'
import { X, Star, Trash2, StarHalf } from 'lucide-react'

interface BookDetailsModalProps {
  book: Book
  isOpen: boolean
  onClose: () => void
}

export function BookDetailsModal({ book, isOpen, onClose }: BookDetailsModalProps) {
  const [rating, setRating] = useState(book.rating || 0)
  const [hoverRating, setHoverRating] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [coverSrc, setCoverSrc] = useState('')

  useEffect(() => {
    if (book.coverType === 'upload' && book.coverBlob) {
      const url = URL.createObjectURL(book.coverBlob)
      setCoverSrc(url)
      return () => URL.revokeObjectURL(url)
    } else if (book.coverType === 'url' && book.coverUrl) {
      setCoverSrc(book.coverUrl)
    }
  }, [book])

  // Update Rating & Serienrating
  const handleRating = async (newRating: number) => {
    setRating(newRating)
    await db.books.update(book.id!, { rating: newRating })
    if (book.seriesId) {
      await updateSeriesRating(book.seriesId)
    }
  }

  // Buch löschen
  const handleDelete = async () => {
    if (!confirm(`"${book.title}" wirklich löschen?`)) return

    setIsDeleting(true)
    try {
      await db.books.delete(book.id!)
      if (book.seriesId) {
        await updateSeriesRating(book.seriesId)
      }
      onClose()
    } catch (error) {
      alert('Fehler beim Löschen des Buches')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-xl pr-8">{book.title}</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          {coverSrc && (
            <img src={coverSrc} alt={book.title} className="w-24 h-36 object-cover rounded-lg" />
          )}
          <div className="flex-1">
            <p className="text-base-content/80 mb-2">von {book.author}</p>
            <div className="badge badge-sm badge-outline">{book.status}</div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-semibold mb-2">Deine Bewertung:</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="rating-star"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => handleRating(star)}
              >
                {star <= (hoverRating || rating) ? (
                  (star - 0.5 === rating) ? (
                    <StarHalf className="w-8 h-8 fill-warning text-warning" />
                  ) : (
                    <Star className="w-8 h-8 fill-warning text-warning" />
                  )
                ) : (
                  <Star className="w-8 h-8 text-base-300" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-action">
          <button
            className="btn btn-error btn-outline"
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
                Löschen
              </>
            )}
          </button>
          <button className="btn" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  )
}
