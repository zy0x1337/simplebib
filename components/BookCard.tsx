'use client'

import { Book } from '@/lib/db'
import { useState, useEffect } from 'react'
import { Star, StarHalf } from 'lucide-react'
import { BookDetailsModal } from './BookDetailsModal'

interface BookCardProps {
  book: Book
  viewMode: 'grid' | 'list'
}

// 5 vintage spine palettes — pick via simple string hash of book.id
const SPINE_PALETTES = [
  { bg: '#2d3a2e', text: '#8faf7a' }, // moss green
  { bg: '#3a2820', text: '#c9956a' }, // terracotta
  { bg: '#1e2a3a', text: '#7a9eb5' }, // slate blue
  { bg: '#3a3020', text: '#c8a85a' }, // ochre
  { bg: '#2a1e2e', text: '#a07ab5' }, // plum
] as const

function getSpine(id?: string) {
  if (!id) return SPINE_PALETTES[0]
  // Simple, fast string hash for palette selection
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return SPINE_PALETTES[hash % SPINE_PALETTES.length]
}

function StarRow({ rating }: { rating?: number }) {
  if (!rating) return null
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const n = i + 1
        if (rating >= n)
          return <Star key={n} className="w-3 h-3" style={{ fill: 'var(--color-star)', color: 'var(--color-star)' }} />
        if (rating >= n - 0.5)
          return <StarHalf key={n} className="w-3 h-3" style={{ fill: 'var(--color-star)', color: 'var(--color-star)' }} />
        return <Star key={n} className="w-3 h-3" style={{ color: 'var(--color-text-faint)' }} />
      })}
    </div>
  )
}

const STATUS = {
  unread:   { cls: 'status-unread',   label: 'Ungelesen' },
  reading:  { cls: 'status-reading',  label: 'Lese ich'  },
  finished: { cls: 'status-finished', label: 'Gelesen'   },
} as const

function CoverPlaceholder({ title, bookId }: { title: string; bookId?: string }) {
  const spine = getSpine(bookId)
  return (
    <div
      className="cover-placeholder w-full h-full flex items-center justify-center p-2"
      style={{ backgroundColor: spine.bg }}
    >
      <span
        style={{ color: spine.text, opacity: 0.7 }}
        className="text-[0.6rem] font-medium leading-tight tracking-wide
                   text-center line-clamp-4 [writing-mode:vertical-rl] rotate-180
                   font-body"
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

  /* ── LIST VIEW ────────────────────────────────────────────── */
  if (viewMode === 'list') {
    return (
      <>
        <article
          className="flex gap-3 px-4 py-3 cursor-pointer rounded-lg transition-colors duration-150"
          style={{ color: 'var(--color-text)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'oklch(from var(--color-text) l c h / 0.04)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          onClick={() => setIsModalOpen(true)}
        >
          {/* Tiny cover */}
          <div
            className="flex-shrink-0 w-9 rounded-md overflow-hidden"
            style={{ height: '3.375rem' }}
          >
            {coverSrc
              ? <img src={coverSrc} alt={book.title} className="w-full h-full object-cover" loading="lazy" />
              : <CoverPlaceholder title={book.title} bookId={book.id} />
            }
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
            <h3 className="card-title-serif truncate" style={{ fontSize: 'var(--text-sm)' }}>
              {book.title}
            </h3>
            <p className="truncate" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)' }}>
              {book.author}
            </p>
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

  /* ── GRID VIEW ────────────────────────────────────────────── */
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
        {/* Cover — 2:3 Aspect Ratio with vignette */}
        <div className="cover-wrap relative aspect-[2/3] rounded-t-[calc(var(--radius-lg)-1px)]">
          {coverSrc ? (
            <img
              src={coverSrc}
              alt={book.title}
              className="w-full h-full object-cover
                         group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            <CoverPlaceholder title={book.title} bookId={book.id} />
          )}

          {/* Status pill — only non-unread to reduce clutter */}
          {book.status !== 'unread' && (
            <div className="absolute top-1.5 left-1.5">
              <span className={status.cls}>{status.label}</span>
            </div>
          )}
        </div>

        {/* Text area */}
        <div className="px-2.5 pt-2 pb-2.5 flex flex-col gap-0.5">
          <h3
            className="card-title-serif line-clamp-2"
            style={{ fontSize: 'var(--text-xs)', lineHeight: 'var(--leading-snug)' }}
          >
            {book.title}
          </h3>
          <p
            className="truncate"
            style={{
              fontSize: '0.65rem',
              color: 'var(--color-text-muted)',
              letterSpacing: 'var(--tracking-wide)',
              lineHeight: 'var(--leading-tight)',
            }}
          >
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
