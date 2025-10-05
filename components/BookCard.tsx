'use client'

import { Book } from '@/lib/db'
import { useState, useEffect } from 'react'
import { Star, StarHalf, Star as StarEmpty, BookOpen } from 'lucide-react'
import { BookDetailsModal } from './BookDetailsModal'

interface BookCardProps {
  book: Book
  viewMode: 'grid' | 'list'
}

function renderStars(rating?: number) {
  if (rating === undefined) return null

  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<Star key={i} className="w-4 h-4 fill-warning text-warning" />)
    } else if (rating >= i - 0.5) {
      stars.push(<StarHalf key={i} className="w-4 h-4 fill-warning text-warning" />)
    } else {
      stars.push(<StarEmpty key={i} className="w-4 h-4 text-base-300" />)
    }
  }
  return <div className="flex gap-0.5">{stars}</div>
}

export function BookCard({ book, viewMode }: BookCardProps) {
  const [coverSrc, setCoverSrc] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Cover Blob oder URL laden
  useEffect(() => {
    if (book.coverType === 'upload' && book.coverBlob) {
      const url = URL.createObjectURL(book.coverBlob)
      setCoverSrc(url)
      return () => URL.revokeObjectURL(url)
    } else if (book.coverType === 'url' && book.coverUrl) {
      setCoverSrc(book.coverUrl)
    }
  }, [book])

  // Status Farben & Labels
  const statusConfig = {
    unread: { color: 'badge-ghost', label: 'Ungelesen' },
    reading: { color: 'badge-info', label: 'Lese ich' },
    finished: { color: 'badge-success', label: 'Gelesen' },
  }

  if (viewMode === 'list') {
    return (
      <>
        <div
          className="card card-side bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <figure className="w-24 flex-shrink-0">
            {coverSrc ? (
              <img src={coverSrc} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-base-300 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-base-content/30" />
              </div>
            )}
          </figure>
          <div className="card-body p-4">
            <h3 className="card-title text-base">{book.title}</h3>
            <p className="text-sm text-base-content/60">{book.author}</p>
            <div className="flex items-center gap-2 mt-2">
              {renderStars(book.rating)}
              <span className={`badge badge-sm ${statusConfig[book.status].color}`}>
                {statusConfig[book.status].label}
              </span>
            </div>
          </div>
        </div>

        <BookDetailsModal
          book={book}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    )
  }

  return (
    <>
      <div className="book-card cursor-pointer" onClick={() => setIsModalOpen(true)}>
        <figure className="aspect-[2/3] bg-base-300">
          {coverSrc ? (
            <img 
              src={coverSrc} 
              alt={book.title} 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-base-content/30" />
            </div>
          )}
        </figure>
        <div className="card-body p-3">
          <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
          <p className="text-xs text-base-content/60 line-clamp-1">{book.author}</p>
          <div className="mt-1">
            {renderStars(book.rating)}
          </div>
        </div>
      </div>

      <BookDetailsModal
        book={book}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
