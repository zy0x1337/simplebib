'use client'

import { Book } from '@/lib/db'
import { useState, useEffect } from 'react'
import { Star, StarHalf, Star as StarEmpty, BookOpen, Calendar, Tag, AlignLeft } from 'lucide-react'
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
      stars.push(<StarEmpty key={i} className="w-4 h-4 text-base-content/30" />)
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
    unread: { color: 'badge-ghost', label: 'Ungelesen', icon: '📖' },
    reading: { color: 'badge-info', label: 'Lese ich', icon: '📍' },
    finished: { color: 'badge-success', label: 'Gelesen', icon: '✅' },
  }

  if (viewMode === 'list') {
    return (
      <>
        <div
          className="card card-side bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
          onClick={() => setIsModalOpen(true)}
        >
          <figure className="w-28 flex-shrink-0 overflow-hidden rounded-l-lg">
            {coverSrc ? (
              <img src={coverSrc} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full bg-base-300 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-base-content/30" />
              </div>
            )}
          </figure>
          <div className="card-body p-4 flex-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="card-title text-lg font-display font-semibold mb-1">{book.title}</h3>
                <p className="text-sm text-base-content/70 flex items-center gap-1">
                  <AlignLeft className="w-3.5 h-3.5" />
                  {book.author}
                </p>
              </div>
              <span className={`badge ${statusConfig[book.status].color} gap-1`}>
                <span>{statusConfig[book.status].icon}</span>
                {statusConfig[book.status].label}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-3">
              {renderStars(book.rating)}
              {book.dateRead && (
                <span className="text-xs text-base-content/50 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(book.dateRead).toLocaleDateString('de-DE')}
                </span>
              )}
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
      <div 
        className="book-card cursor-pointer group" 
        onClick={() => setIsModalOpen(true)}
      >
        <figure className="aspect-[2/3] bg-base-300 overflow-hidden">
          {coverSrc ? (
            <img 
              src={coverSrc} 
              alt={book.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-base-300 to-base-200">
              <BookOpen className="w-14 h-14 text-base-content/20" />
            </div>
          )}
        </figure>
        <div className="card-body p-4">
          <h3 className="font-display font-semibold text-base line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-base-content/60 flex items-center gap-1">
            <AlignLeft className="w-3 h-3" />
            {book.author}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {renderStars(book.rating)}
            </div>
            <span 
              className={`badge badge-xs ${statusConfig[book.status].color}`}
              title={statusConfig[book.status].label}
            >
              {statusConfig[book.status].icon}
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
