// 🎯 PWA-Pattern: Book Display Card
// ✅ TypeScript Strict Mode
// ⚡ Lazy Image Loading
// 📱 Touch-Optimized

'use client'

import { Book } from '@/lib/db'
import { Star, BookOpen } from 'lucide-react'
import { useState, useEffect } from 'react'

interface BookCardProps {
  book: Book
  viewMode: 'grid' | 'list'
}

export function BookCard({ book, viewMode }: BookCardProps) {
  const [coverSrc, setCoverSrc] = useState<string>('')

  // Load Cover (Blob or URL)
  useEffect(() => {
    if (book.coverType === 'upload' && book.coverBlob) {
      const url = URL.createObjectURL(book.coverBlob)
      setCoverSrc(url)
      return () => URL.revokeObjectURL(url)
    } else if (book.coverType === 'url' && book.coverUrl) {
      setCoverSrc(book.coverUrl)
    }
  }, [book])

  // Render Stars
  const renderStars = () => {
    if (!book.rating) return null
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= book.rating! ? 'fill-warning text-warning' : 'text-base-300'
            }`}
          />
        ))}
      </div>
    )
  }

  // Status Badge
  const statusColors = {
    unread: 'badge-ghost',
    reading: 'badge-info',
    finished: 'badge-success',
  }

  if (viewMode === 'list') {
    return (
      <div className="card card-side bg-base-100 shadow-md hover:shadow-lg transition-shadow">
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
          <div className="flex items-center gap-2">
            {renderStars()}
            <span className={`badge badge-sm ${statusColors[book.status]}`}>
              {book.status}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="book-card">
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
        {renderStars()}
      </div>
    </div>
  )
}
