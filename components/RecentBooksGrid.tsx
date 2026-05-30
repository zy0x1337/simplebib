'use client'

import { useState, useMemo } from 'react'
import { Book } from '@/lib/db'
import { BookDetailsModal } from '@/components/BookDetailsModal'
import { Star } from 'lucide-react'

// 5 vintage spine palettes for featured card placeholder
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

function relativeDays(date: Date): string {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
  if (days === 0) return 'Heute'
  if (days === 1) return 'Gestern'
  if (days < 7)  return `Vor ${days} Tagen`
  if (days < 30) return `Vor ${Math.floor(days / 7)} Wochen`
  return new Date(date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })
}

const STATUS_LABEL: Record<string, string> = {
  unread: 'Ungelesen', reading: 'Lese ich', finished: 'Gelesen',
}

/* ─── Featured Card (Book #1) ─────────────────────────────────── */

function FeaturedCard({ book }: { book: Book }) {
  const [isOpen, setIsOpen] = useState(false)
  const spine = spineFor(book.id)

  const coverSrc = useMemo(() => {
    if (book.coverType === 'upload' && book.coverBlob) return URL.createObjectURL(book.coverBlob)
    if (book.coverType === 'url' && book.coverUrl) return book.coverUrl
    return ''
  }, [book.coverBlob, book.coverUrl, book.coverType])

  return (
    <>
      <article
        onClick={() => setIsOpen(true)}
        role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setIsOpen(true)}
        aria-label={`${book.title} von ${book.author}`}
        className="anim-fade-up"
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          cursor: 'pointer',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          minHeight: '220px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          background: spine.bg,
        }}
        onMouseDown={e => {
          const el = e.currentTarget as HTMLElement
          el.style.filter = 'brightness(0.92)'
          setTimeout(() => { el.style.filter = '' }, 120)
        }}
      >
        {/* Cover image or placeholder */}
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={book.title}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
            }}
            loading="lazy"
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0.15,
          }}>
            <span style={{
              color: spine.text,
              fontSize: 'clamp(1.5rem, 5vw, 3rem)',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 300,
              textAlign: 'center',
              padding: 'var(--space-4)',
              lineHeight: 1.2,
            }}>
              {book.title}
            </span>
          </div>
        )}

        {/* Gradient overlay for text readability */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Card content */}
        <div style={{
          position: 'relative',
          padding: 'var(--space-4)',
          color: '#fff',
        }}>
          {/* Status pill */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.15rem 0.5rem',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            letterSpacing: 'var(--tracking-widest)',
            textTransform: 'uppercase',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(4px)',
            marginBottom: 'var(--space-2)',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', opacity: 0.7 }} />
            {STATUS_LABEL[book.status]}
          </span>

          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lg)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-tight)',
            marginBottom: 'var(--space-1)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {book.title}
          </h3>
          <p style={{
            fontSize: 'var(--text-sm)',
            opacity: 0.8,
            letterSpacing: 'var(--tracking-wide)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {book.author}
          </p>

          {/* Rating + time */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 'var(--space-2)',
            fontSize: 'var(--text-xs)',
            opacity: 0.7,
          }}>
            {book.rating ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Star style={{ width: '0.75rem', height: '0.75rem', fill: 'var(--color-star)', color: 'var(--color-star)' }} />
                {book.rating}
              </span>
            ) : <span />}
            <span>{relativeDays(book.dateAdded)}</span>
          </div>
        </div>
      </article>

      <BookDetailsModal book={book} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

/* ─── Small Card (Books #2-6) ─────────────────────────────────── */

function SmallCard({ book }: { book: Book }) {
  const [isOpen, setIsOpen]   = useState(false)
  const spine = spineFor(book.id)

  const coverSrc = useMemo(() => {
    if (book.coverType === 'upload' && book.coverBlob) return URL.createObjectURL(book.coverBlob)
    if (book.coverType === 'url' && book.coverUrl) return book.coverUrl
    return ''
  }, [book.coverBlob, book.coverUrl, book.coverType])

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
        <div className="cover-wrap relative aspect-[2/3] rounded-t-[calc(var(--radius-lg)-1px)]">
          {coverSrc ? (
            <img src={coverSrc} alt={book.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              loading="lazy" />
          ) : (
            <div style={{
              width: '100%', height: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: spine.bg,
            }}>
              <span style={{
                color: spine.text, opacity: 0.6,
                fontSize: '0.5rem', fontWeight: 500,
                textAlign: 'center', padding: '0.25rem',
                lineHeight: 1.2,
                writingMode: 'vertical-rl', transform: 'rotate(180deg)',
                fontFamily: 'var(--font-body)',
              }}>
                {book.title}
              </span>
            </div>
          )}
          {book.status !== 'unread' && (
            <div style={{ position: 'absolute', top: '0.375rem', left: '0.375rem' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                padding: '0.1rem 0.4rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.55rem',
                fontWeight: 600,
                letterSpacing: 'var(--tracking-widest)',
                textTransform: 'uppercase',
                background: book.status === 'reading' ? 'var(--color-reading-muted)' : 'var(--color-accent-muted)',
                color: book.status === 'reading' ? 'var(--color-reading)' : 'var(--color-accent)',
              }}>
                {STATUS_LABEL[book.status]}
              </span>
            </div>
          )}
        </div>
        <div style={{ padding: 'var(--space-1) var(--space-2) var(--space-2)' }}>
          <p style={{
            fontSize: 'var(--text-xs)', fontWeight: 500,
            lineHeight: 'var(--leading-snug)',
            overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', color: 'var(--color-text)',
          }}>
            {book.title}
          </p>
          <p style={{
            fontSize: '0.6rem', color: 'var(--color-text-muted)',
            letterSpacing: 'var(--tracking-wide)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {book.author}
          </p>
        </div>
      </article>

      <BookDetailsModal book={book} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

/* ─── Wide Card (Book #6, horizontal) ─────────────────────────── */

function WideCard({ book }: { book: Book }) {
  const [isOpen, setIsOpen]   = useState(false)
  const spine = spineFor(book.id)

  const coverSrc = useMemo(() => {
    if (book.coverType === 'upload' && book.coverBlob) return URL.createObjectURL(book.coverBlob)
    if (book.coverType === 'url' && book.coverUrl) return book.coverUrl
    return ''
  }, [book.coverBlob, book.coverUrl, book.coverType])

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
        style={{ display: 'flex', alignItems: 'stretch' }}
      >
        {/* Cover on the left, fixed narrow width */}
        <div className="cover-wrap" style={{
          width: '4rem', flexShrink: 0,
          borderTopLeftRadius: 'var(--radius-lg)',
          borderBottomLeftRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}>
          {coverSrc ? (
            <img src={coverSrc} alt={book.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              loading="lazy" />
          ) : (
            <div style={{
              width: '100%', height: '100%', minHeight: '5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: spine.bg,
            }}>
              <span style={{
                color: spine.text, opacity: 0.6, fontSize: '0.5rem',
                fontWeight: 500, textAlign: 'center', padding: '0.25rem',
                lineHeight: 1.2, fontFamily: 'var(--font-body)',
              }}>
                {book.title}
              </span>
            </div>
          )}
        </div>

        {/* Info on the right */}
        <div style={{
          flex: 1, minWidth: 0,
          padding: 'var(--space-2) var(--space-3)',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', gap: 'var(--space-1)',
        }}>
          <p style={{
            fontSize: 'var(--text-xs)', fontWeight: 500,
            lineHeight: 'var(--leading-snug)', color: 'var(--color-text)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {book.title}
          </p>
          <p style={{
            fontSize: '0.6rem', color: 'var(--color-text-muted)',
            letterSpacing: 'var(--tracking-wide)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {book.author}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
              padding: '0.1rem 0.35rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.55rem', fontWeight: 600,
              letterSpacing: 'var(--tracking-widest)',
              textTransform: 'uppercase',
              background: book.status === 'reading' ? 'var(--color-reading-muted)'
                : book.status === 'finished' ? 'var(--color-accent-muted)'
                : 'oklch(from var(--color-text-muted) l c h / 0.10)',
              color: book.status === 'reading' ? 'var(--color-reading)'
                : book.status === 'finished' ? 'var(--color-accent)'
                : 'var(--color-text-muted)',
            }}>
              {STATUS_LABEL[book.status]}
            </span>
            {book.rating ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', fontSize: '0.6rem', color: 'var(--color-star)' }}>
                <Star style={{ width: '0.6rem', height: '0.6rem', fill: 'var(--color-star)' }} />
                {book.rating}
              </span>
            ) : null}
          </div>
        </div>
      </article>

      <BookDetailsModal book={book} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

/* ─── Bento Grid Container ────────────────────────────────────── */

interface RecentBooksGridProps {
  books: Book[]
}

export function RecentBooksGrid({ books }: RecentBooksGridProps) {
  if (books.length === 0) return null

  const [featured, ...rest] = books

  // Layout varies by count
  const count = books.length

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridAutoRows: 'auto',
        gap: 'var(--space-2)',
        overflow: 'hidden',
      }}
      className="max-sm:grid-cols-2 max-sm:gap-[var(--space-2)]"
    >
      {/* ── Desktop Layout ── */}
      <div className="hidden sm:contents">
        {/* Featured: spans 2 cols × 2 rows */}
        <div style={{ gridColumn: 'span 2', gridRow: 'span 2' }}>
          <FeaturedCard book={featured} />
        </div>

        {/* Book 2 */}
        {rest[0] && (
          <div style={{ gridColumn: 'span 1', gridRow: 'span 1', animation: 'fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.04s' }}>
            <SmallCard book={rest[0]} />
          </div>
        )}
        {/* Book 3 */}
        {rest[1] && (
          <div style={{ gridColumn: 'span 1', gridRow: 'span 1', animation: 'fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.08s' }}>
            <SmallCard book={rest[1]} />
          </div>
        )}

        {/* Books 4-5 */}
        {rest[2] && (
          <div style={{ gridColumn: 'span 1', gridRow: 'span 1', animation: 'fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.12s' }}>
            <SmallCard book={rest[2]} />
          </div>
        )}
        {rest[3] && (
          <div style={{ gridColumn: 'span 1', gridRow: 'span 1', animation: 'fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.16s' }}>
            <SmallCard book={rest[3]} />
          </div>
        )}

        {/* Book 6: full width of remaining columns — horizontal layout */}
        {rest[4] && (
          <div style={{ gridColumn: 'span 2', animation: 'fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.20s' }}>
            <WideCard book={rest[4]} />
          </div>
        )}
      </div>

      {/* ── Mobile Layout (2 columns, stacked) ── */}
      <div className="sm:hidden contents">
        {/* Featured: full width */}
        <div style={{ gridColumn: 'span 2' }} className="anim-fade-up">
          <FeaturedCard book={featured} />
        </div>

        {/* Rest: 2-column grid */}
        {rest.map((book, i) => (
          <div key={book.id} className="anim-fade-up" style={{ animationDelay: `${(i+1) * 0.05}s` } as any}>
            <SmallCard book={book} />
          </div>
        ))}
      </div>
    </div>
  )
}
