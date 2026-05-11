'use client'

import { Book } from '@/lib/db'
import { useState, useEffect } from 'react'
import { Star, StarHalf, BookOpen } from 'lucide-react'
import { BookDetailsModal } from './BookDetailsModal'

interface BookCardProps {
  book: Book
  viewMode: 'grid' | 'list'
}

function StarRow({ rating }: { rating?: number }) {
  if (rating === undefined || rating === 0) return null
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const n = i + 1
        if (rating >= n)
          return <Star key={n} className="w-3.5 h-3.5 fill-warning text-warning" />
        if (rating >= n - 0.5)
          return <StarHalf key={n} className="w-3.5 h-3.5 fill-warning text-warning" />
        return <Star key={n} className="w-3.5 h-3.5 text-base-content/20" />
      })}
    </div>
  )
}

const STATUS = {
  unread:   { cls: 'status-unread',   label: 'Ungelesen' },
  reading:  { cls: 'status-reading',  label: 'Lese ich'  },
  finished: { cls: 'status-finished', label: 'Gelesen'   },
} as const

export function BookCard({ book, viewMode }: BookCardProps) {
  const [coverSrc, setCoverSrc] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (book.coverType === 'upload' && book.coverBlob) {
      const url = URL.createObjectURL(book.coverBlob)
      setCoverSrc(url)
      return () => URL.revokeObjectURL(url)
    } else if (book.coverType === 'url' && book.coverUrl) {
      setCoverSrc(book.coverUrl)
    }
  }, [book])

  const status = STATUS[book.status]

  /* ── LIST VIEW ───────────────────────────────────────────── */
  if (viewMode === 'list') {
    return (
      <>
        <article
          className="flex gap-4 px-4 py-3 cursor-pointer group
                     hover:bg-base-content/4
                     transition-colors duration-150 rounded-lg"
          onClick={() => setIsModalOpen(true)}
        >
          {/* Cover — kleines Thumbnail */}
          <div className="flex-shrink-0 w-10 h-14 rounded overflow-hidden bg-base-300">
            {coverSrc ? (
              <img
                src={coverSrc}
                alt={book.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-base-content/25" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
            <h3 className="card-title-serif text-sm leading-snug truncate
                           group-hover:text-primary transition-colors">
              {book.title}
            </h3>
            <p className="text-xs text-base-content/50 font-body truncate">
              {book.author}
            </p>
            {book.rating ? <StarRow rating={book.rating} /> : null}
          </div>

          {/* Status */}
          <div className="flex-shrink-0 flex items-center">
            <span className={status.cls}>{status.label}</span>
          </div>
        </article>

        <BookDetailsModal
          book={book}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    )
  }

  /* ── GRID VIEW ─────────────────────────────────────────────── */
  return (
    <>
      <article
        className="book-card group"
        onClick={() => setIsModalOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setIsModalOpen(true)}
        aria-label={`${book.title} von ${book.author}`}
      >
        {/* Cover — 2:3 Aspect Ratio */}
        <div className="relative aspect-[2/3] bg-base-300 overflow-hidden">
          {coverSrc ? (
            <img
              src={coverSrc}
              alt={book.title}
              className="w-full h-full object-cover
                         group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2
                            bg-gradient-to-b from-base-300 to-base-200">
              <BookOpen className="w-10 h-10 text-base-content/15" />
              <span className="label-caps">Kein Cover</span>
            </div>
          )}

          {/* Status-Chip über dem Cover */}
          <div className="absolute top-2 left-2">
            <span className={status.cls}>{status.label}</span>
          </div>
        </div>

        {/* Text-Bereich */}
        <div className="px-3 pt-3 pb-3.5 flex flex-col gap-1">
          <h3 className="card-title-serif text-sm leading-snug line-clamp-2
                         group-hover:text-primary transition-colors duration-200">
            {book.title}
          </h3>
          <p className="text-xs text-base-content/50 truncate">
            {book.author}
          </p>
          {book.rating ? (
            <div className="mt-1.5">
              <StarRow rating={book.rating} />
            </div>
          ) : null}
        </div>
      </article>

      <BookDetailsModal
        book={book}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
