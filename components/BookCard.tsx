'use client'

import { Book } from '@/lib/db'
import { useState, useEffect } from 'react'
import { Star, StarHalf } from 'lucide-react'
import { BookDetailsModal } from './BookDetailsModal'

interface BookCardProps {
  book: Book
  viewMode: 'grid' | 'list'
}

function StarRow({ rating }: { rating?: number }) {
  if (!rating) return null
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const n = i + 1
        if (rating >= n)
          return <Star key={n} className="w-3 h-3 fill-warning text-warning" />
        if (rating >= n - 0.5)
          return <StarHalf key={n} className="w-3 h-3 fill-warning text-warning" />
        return <Star key={n} className="w-3 h-3 text-base-content/15" />
      })}
    </div>
  )
}

const STATUS = {
  unread:   { cls: 'status-unread',   label: 'Ungelesen' },
  reading:  { cls: 'status-reading',  label: 'Lese ich'  },
  finished: { cls: 'status-finished', label: 'Gelesen'   },
} as const

/*
  CoverPlaceholder: zeigt den Buchtitel vertikal als Buchrücken-ästhetik.
  Diagonal-Streifen-Hintergrund (cover-placeholder utility) +
  rotierter Titel wie ein echter Bucheinband ohne Cover-Scan.
*/
function CoverPlaceholder({ title }: { title: string }) {
  return (
    <div className="cover-placeholder w-full h-full flex items-center justify-center p-2">
      <span
        className="font-display text-[0.6rem] font-semibold text-base-content/35
                   leading-tight tracking-wide text-center line-clamp-4
                   [writing-mode:vertical-rl] rotate-180"
      >
        {title}
      </span>
    </div>
  )
}

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

  /* ── LIST VIEW ───────────────────────────────────────────────── */
  if (viewMode === 'list') {
    return (
      <>
        <article
          className="flex gap-3 px-4 py-3 cursor-pointer group
                     hover:bg-base-content/4 active:bg-base-content/6
                     transition-colors duration-150 rounded-lg"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="flex-shrink-0 w-9 h-[3.375rem] rounded-md overflow-hidden bg-base-300">
            {coverSrc
              ? <img src={coverSrc} alt={book.title} className="w-full h-full object-cover" loading="lazy" />
              : <CoverPlaceholder title={book.title} />
            }
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
            <h3 className="card-title-serif text-sm leading-snug truncate
                           group-hover:text-primary transition-colors">
              {book.title}
            </h3>
            <p className="text-xs text-base-content/50 truncate">{book.author}</p>
            {book.rating ? <StarRow rating={book.rating} /> : null}
          </div>
          <div className="flex-shrink-0 flex items-center">
            <span className={status.cls}>{status.label}</span>
          </div>
        </article>
        <BookDetailsModal book={book} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    )
  }

  /* ── GRID VIEW ──────────────────────────────────────────────────── */
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
        <div className="relative aspect-[2/3] overflow-hidden rounded-t-[0.55rem]">
          {coverSrc ? (
            <img
              src={coverSrc}
              alt={book.title}
              className="w-full h-full object-cover
                         group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            <CoverPlaceholder title={book.title} />
          )}

          {/* Status-Chip — nur bei nicht-unread anzeigen, um Clutter zu reduzieren */}
          {book.status !== 'unread' && (
            <div className="absolute top-1.5 left-1.5">
              <span className={status.cls}>{status.label}</span>
            </div>
          )}
        </div>

        {/* Text-Bereich */}
        <div className="px-2.5 pt-2 pb-2.5 flex flex-col gap-0.5">
          <h3 className="card-title-serif text-xs leading-snug line-clamp-2
                         group-hover:text-primary transition-colors duration-200">
            {book.title}
          </h3>
          <p className="text-[0.65rem] text-base-content/45 truncate leading-tight">
            {book.author}
          </p>
          {book.rating ? (
            <div className="mt-1">
              <StarRow rating={book.rating} />
            </div>
          ) : null}
        </div>
      </article>

      <BookDetailsModal book={book} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
