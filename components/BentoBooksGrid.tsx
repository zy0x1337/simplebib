'use client'

import { useState, useMemo } from 'react'
import { Book } from '@/lib/db'
import { BookDetailsModal } from '@/components/BookDetailsModal'
import { Star } from 'lucide-react'

const SPINE = [
  { bg: '#2d3a2e', text: '#8faf7a' },
  { bg: '#3a2820', text: '#c9956a' },
  { bg: '#1e2a3a', text: '#7a9eb5' },
  { bg: '#3a3020', text: '#c8a85a' },
  { bg: '#2a1e2e', text: '#a07ab5' },
] as const

function spineFor(id?: string) {
  if (!id) return SPINE[0]
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return SPINE[hash % SPINE.length]
}

function useCoverSrc(book: Book) {
  return useMemo(() => {
    if (book.coverType === 'upload' && book.coverBlob) return URL.createObjectURL(book.coverBlob)
    if (book.coverType === 'url' && book.coverUrl) return book.coverUrl
    return ''
  }, [book.coverBlob, book.coverUrl, book.coverType])
}

const STATUS_LABEL: Record<string, string> = {
  unread: 'Ungelesen', reading: 'Lese ich', finished: 'Gelesen',
}

/* ─── Featured Book (horizontal, spans 2 cols) ────────────────── */

function FeaturedBookCard({ book }: { book: Book }) {
  const [isOpen, setIsOpen] = useState(false)
  const spine    = spineFor(book.id)
  const coverSrc = useCoverSrc(book)

  return (
    <>
      <article
        onClick={() => setIsOpen(true)}
        role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setIsOpen(true)}
        aria-label={`${book.title} von ${book.author}`}
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          cursor: 'pointer',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          background: spine.bg,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-end',
          height: 'clamp(140px, 25vw, 200px)',
        }}
        onMouseDown={e => {
          const el = e.currentTarget as HTMLElement
          el.style.filter = 'brightness(0.92)'
          setTimeout(() => { el.style.filter = '' }, 120)
        }}
      >
        {coverSrc ? (
          <img src={coverSrc} alt={book.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy" />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
            <span style={{ color: spine.text, fontSize: 'clamp(0.8rem, 2vw, 1.6rem)', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 300, textAlign: 'center', padding: 'var(--space-2)', lineHeight: 1.2 }}>
              {book.title}
            </span>
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', padding: 'clamp(var(--space-1), 2vw, var(--space-3))', color: '#fff' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-full)', fontSize: 'clamp(0.6rem, 1vw, 0.7rem)', fontWeight: 600, letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(4px)', marginBottom: '0.3rem' }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor', opacity: 0.7 }} />
            {STATUS_LABEL[book.status]}
          </span>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(0.75rem, 1.6vw, var(--text-base))', fontStyle: 'italic', fontWeight: 400, lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tight)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {book.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.2rem', fontSize: 'clamp(0.65rem, 1vw, 0.75rem)', opacity: 0.8 }}>
            <span style={{ letterSpacing: 'var(--tracking-wide)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: book.rating ? '70%' : '100%' }}>{book.author}</span>
            {book.rating ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.1rem', flexShrink: 0 }}><Star style={{ width: '0.7rem', height: '0.7rem', fill: 'var(--color-star)', color: 'var(--color-star)' }} />{book.rating}</span> : null}
          </div>
        </div>
      </article>
      <BookDetailsModal book={book} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

/* ─── Normal Grid Book Card ───────────────────────────────────── */

function GridBookCard({ book }: { book: Book }) {
  const [isOpen, setIsOpen] = useState(false)
  const spine    = spineFor(book.id)
  const coverSrc = useCoverSrc(book)

  return (
    <>
      <article
        className="book-card"
        onClick={() => setIsOpen(true)}
        role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setIsOpen(true)}
        aria-label={`${book.title} von ${book.author}`}
        onMouseDown={e => {
          const el = e.currentTarget as HTMLElement
          el.style.background = 'var(--color-surface-accent)'
          setTimeout(() => { el.style.background = '' }, 120)
        }}
      >
        <div className="cover-wrap aspect-[2/3] rounded-t-[calc(var(--radius-lg)-1px)]">
          {coverSrc ? (
            <img src={coverSrc} alt={book.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: spine.bg }}>
              <span style={{ color: spine.text, opacity: 0.6, fontSize: 'clamp(0.45rem, 1vw, 0.55rem)', fontWeight: 500, textAlign: 'center', padding: '0.25rem', lineHeight: 1.2, writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontFamily: 'var(--font-body)' }}>
                {book.title}
              </span>
            </div>
          )}
          {(book.status === 'reading' || book.status === 'finished') && (
            <div style={{ position: 'absolute', top: '0.25rem', left: '0.25rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.12rem', padding: '0.08rem 0.35rem', borderRadius: 'var(--radius-full)', fontSize: 'clamp(0.55rem, 0.9vw, 0.6rem)', fontWeight: 600, letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', lineHeight: 1.3, background: book.status === 'reading' ? 'var(--color-reading-muted)' : 'var(--color-accent-muted)', color: book.status === 'reading' ? 'var(--color-reading)' : 'var(--color-accent)' }}>
                {STATUS_LABEL[book.status]}
              </span>
            </div>
          )}
        </div>
        <div style={{ padding: 'clamp(0.3rem, 1vw, var(--space-2))' }}>
          <p style={{ fontSize: 'clamp(0.65rem, 1.2vw, var(--text-xs))', fontWeight: 500, lineHeight: 'var(--leading-snug)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-text)' }}>{book.title}</p>
          <p style={{ fontSize: 'clamp(0.55rem, 1vw, 0.65rem)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.1rem' }}>{book.author}</p>
        </div>
      </article>
      <BookDetailsModal book={book} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

/* ─── Bento Books Grid ──────────────────────────────────────────
   Pattern: featured (span 2) → 3 normal → featured → 3 normal → …
   Mobile: featured = full width, normal = 1-col
   Desktop: 4-col grid with alternating featured spans
─────────────────────────────────────────────────────────────────── */

interface BentoBooksGridProps {
  books: Book[]
}

export function BentoBooksGrid({ books }: BentoBooksGridProps) {
  if (books.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-8) 0', textAlign: 'center' }}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true" style={{ color: 'var(--color-text-faint)' }}>
        <rect x="6" y="5" width="22" height="30" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <line x1="6" y1="12" x2="28" y2="12" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
      </svg>
      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'var(--text-base)', color: 'var(--color-text-faint)' }}>Keine Treffer</p>
    </div>
  )

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 overflow-hidden"
      style={{ gap: 'clamp(6px, 1.2vw, 10px)', width: '100%', minWidth: 0 }}
    >
      {books.map((book, i) => {
        // Featured pattern: every 5th item (0, 5, 10, …) gets featured
        const isFeatured = i % 5 === 0
        return (
          <div
            key={book.id}
            className="anim-fade-up"
            style={{
              gridColumn: isFeatured ? 'span 2' : 'span 1',
              animationDelay: `${Math.min(i * 0.02, 0.4)}s`,
            } as any}
          >
            {isFeatured ? <FeaturedBookCard book={book} /> : <GridBookCard book={book} />}
          </div>
        )
      })}
    </div>
  )
}
