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

/* ─── Cover Src Hook ──────────────────────────────────────────── */

function useCoverSrc(book: Book) {
  return useMemo(() => {
    if (book.coverType === 'upload' && book.coverBlob) return URL.createObjectURL(book.coverBlob)
    if (book.coverType === 'url' && book.coverUrl) return book.coverUrl
    return ''
  }, [book.coverBlob, book.coverUrl, book.coverType])
}

/* ─── Featured Card ─────────────────────────────────────────────
   Desktop: full-bleed cover background, tall → grande
   Mobile:  same approach, but shorter — cover is still visible
─────────────────────────────────────────────────────────────────── */

function FeaturedCard({ book }: { book: Book }) {
  const [isOpen, setIsOpen] = useState(false)
  const spine   = spineFor(book.id)
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
          display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-end',
          background: spine.bg,
          // Fluid height: shorter on mobile, taller on desktop
          minHeight: 'clamp(150px, 28vw, 260px)',
          height: 'clamp(150px, 28vw, 260px)',
        }}
        onMouseDown={e => {
          const el = e.currentTarget as HTMLElement
          el.style.filter = 'brightness(0.92)'
          setTimeout(() => { el.style.filter = '' }, 120)
        }}
      >
        {/* Cover image — absolute background */}
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
            opacity: 0.12,
          }}>
            <span style={{
              color: spine.text,
              fontSize: 'clamp(0.9rem, 2.5vw, 2.2rem)',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic', fontWeight: 300,
              textAlign: 'center', padding: 'var(--space-3)',
              lineHeight: 1.2,
            }}>
              {book.title}
            </span>
          </div>
        )}

        {/* Gradient — stronger at bottom for text readability */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `
            linear-gradient(
              to top,
              rgba(0,0,0,0.85) 0%,
              rgba(0,0,0,0.35) 40%,
              rgba(0,0,0,0.05) 75%,
              transparent 100%
            )`,
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          padding: 'clamp(var(--space-2), 2.5vw, var(--space-5))',
          color: '#fff',
        }}>
          {/* Status pill */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
            padding: '0.15rem 0.5rem',
            borderRadius: 'var(--radius-full)',
            fontSize: 'clamp(0.65rem, 1.2vw, 0.75rem)',
            fontWeight: 600,
            letterSpacing: 'var(--tracking-widest)',
            textTransform: 'uppercase',
            background: 'rgba(255,255,255,0.14)',
            backdropFilter: 'blur(4px)',
            marginBottom: 'clamp(0.3rem, 0.8vw, 0.5rem)',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', opacity: 0.7 }} />
            {STATUS_LABEL[book.status]}
          </span>

          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(0.85rem, 2.2vw, var(--text-lg))',
            fontStyle: 'italic', fontWeight: 400,
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-tight)',
            display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {book.title}
          </h3>

          {/* Author + Rating + Date */}
          <div style={{
            display: 'flex', alignItems: 'baseline', flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginTop: 'clamp(0.2rem, 0.5vw, 0.4rem)',
            fontSize: 'clamp(0.7rem, 1.1vw, 0.8rem)',
            opacity: 0.78,
            gap: '0.25rem',
          }}>
            <span style={{
              letterSpacing: 'var(--tracking-wide)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: book.rating ? '65%' : '100%',
            }}>
              {book.author}
            </span>
            {book.rating ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', flexShrink: 0 }}>
                <Star style={{ width: '0.75rem', height: '0.75rem', fill: 'var(--color-star)', color: 'var(--color-star)' }} />
                {book.rating}
              </span>
            ) : null}
          </div>

          <p style={{
            fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)',
            opacity: 0.55, marginTop: '0.25rem',
          }}>
            {relativeDays(book.dateAdded)}
          </p>
        </div>
      </article>

      <BookDetailsModal book={book} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

/* ─── Small Card ────────────────────────────────────────────────
   Standard 2:3 cover card. Works in 2-5 col grids.
   Touch: entire card is tappable — min 44px guaranteed by cover height.
─────────────────────────────────────────────────────────────────── */

function SmallCard({ book }: { book: Book }) {
  const [isOpen, setIsOpen] = useState(false)
  const spine    = spineFor(book.id)
  const coverSrc = useCoverSrc(book)
  // Fluid status pill — readable on all widths
  const pillSz = 'clamp(0.6rem, 1vw, 0.65rem)'

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
            <img src={coverSrc} alt={book.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            <div style={{
              width: '100%', height: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: spine.bg,
            }}>
              <span style={{
                color: spine.text, opacity: 0.6,
                fontSize: 'clamp(0.5rem, 1.2vw, 0.6rem)', fontWeight: 500,
                textAlign: 'center', padding: '0.25rem',
                lineHeight: 1.2,
                writingMode: 'vertical-rl', transform: 'rotate(180deg)',
                fontFamily: 'var(--font-body)',
              }}>
                {book.title}
              </span>
            </div>
          )}
          {/* Status pill — only non-unread, fluid sizing */}
          {(book.status === 'reading' || book.status === 'finished') && (
            <div style={{ position: 'absolute', top: '0.25rem', left: '0.25rem' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.15rem',
                padding: 'clamp(0.1rem, 0.4vw, 0.15rem) clamp(0.3rem, 0.8vw, 0.45rem)',
                borderRadius: 'var(--radius-full)',
                fontSize: pillSz, fontWeight: 600,
                letterSpacing: 'var(--tracking-widest)',
                textTransform: 'uppercase',
                lineHeight: 1.3,
                background: book.status === 'reading'
                  ? 'var(--color-reading-muted)' : 'var(--color-accent-muted)',
                color: book.status === 'reading'
                  ? 'var(--color-reading)' : 'var(--color-accent)',
              }}>
                {STATUS_LABEL[book.status]}
              </span>
            </div>
          )}
          {/* Show unread pill on mobile too — less visual noise on desktop, always visible on small */}
          {book.status === 'unread' && (
            <div className="sm:hidden" style={{ position: 'absolute', top: '0.25rem', left: '0.25rem' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.15rem',
                padding: 'clamp(0.1rem, 0.4vw, 0.15rem) clamp(0.3rem, 0.8vw, 0.45rem)',
                borderRadius: 'var(--radius-full)',
                fontSize: pillSz, fontWeight: 600,
                letterSpacing: 'var(--tracking-widest)',
                textTransform: 'uppercase', lineHeight: 1.3,
                background: 'oklch(from var(--color-text-muted) l c h / 0.10)',
                color: 'var(--color-text-muted)',
              }}>
                {STATUS_LABEL[book.status]}
              </span>
            </div>
          )}
        </div>

        {/* Title + Author */}
        <div style={{
          padding: 'clamp(var(--space-1), 1.8vw, var(--space-2))',
        }}>
          <p style={{
            fontSize: 'clamp(0.7rem, 1.3vw, var(--text-xs))',
            fontWeight: 500,
            lineHeight: 'var(--leading-snug)',
            overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', color: 'var(--color-text)',
          }}>
            {book.title}
          </p>
          <p style={{
            fontSize: 'clamp(0.6rem, 1.1vw, 0.7rem)',
            color: 'var(--color-text-muted)',
            letterSpacing: 'var(--tracking-wide)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            marginTop: '0.15rem',
          }}>
            {book.author}
          </p>
        </div>
      </article>

      <BookDetailsModal book={book} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

/* ─── Wide Horizontal Card ──────────────────────────────────────
   Cover on left, info on right. Used for book #6 (span 2).
   Min-height ensures touch target ≥ 44px.
─────────────────────────────────────────────────────────────────── */

function WideCard({ book }: { book: Book }) {
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
        style={{
          display: 'flex', alignItems: 'stretch',
          minHeight: 'clamp(44px, 8vw, 56px)',
        }}
      >
        {/* Cover — fluid width */}
        <div style={{
          width: 'clamp(3rem, 7vw, 4rem)', flexShrink: 0,
          borderTopLeftRadius: 'var(--radius-lg)',
          borderBottomLeftRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}>
          {coverSrc ? (
            <img src={coverSrc} alt={book.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '100%' }}
              loading="lazy"
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              minHeight: 'clamp(44px, 8vw, 56px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: spine.bg,
            }}>
              <span style={{
                color: spine.text, opacity: 0.6,
                fontSize: 'clamp(0.45rem, 1vw, 0.55rem)',
                fontWeight: 500, textAlign: 'center',
                padding: '0.25rem', lineHeight: 1.2,
                fontFamily: 'var(--font-body)',
              }}>
                {book.title}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{
          flex: 1, minWidth: 0,
          padding: 'clamp(var(--space-1), 2vw, var(--space-3))',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', gap: '0.15rem',
        }}>
          <p style={{
            fontSize: 'clamp(0.7rem, 1.3vw, var(--text-xs))',
            fontWeight: 500,
            lineHeight: 'var(--leading-snug)', color: 'var(--color-text)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {book.title}
          </p>
          <p style={{
            fontSize: 'clamp(0.6rem, 1.1vw, 0.7rem)',
            color: 'var(--color-text-muted)',
            letterSpacing: 'var(--tracking-wide)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {book.author}
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
            marginTop: '0.125rem',
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.12rem',
              padding: '0.06rem 0.35rem',
              borderRadius: 'var(--radius-full)',
              fontSize: 'clamp(0.6rem, 1vw, 0.65rem)', fontWeight: 600,
              letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase',
              lineHeight: 1.3,
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
              <span style={{
                display: 'flex', alignItems: 'center', gap: '0.12rem',
                fontSize: 'clamp(0.6rem, 1vw, 0.7rem)',
                color: 'var(--color-star)',
              }}>
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

/* ─── Bento Grid ────────────────────────────────────────────────
   Single DOM. Responsive grid. overflow-x: hidden.
   Gap tightens on very small screens.
─────────────────────────────────────────────────────────────────── */

interface RecentBooksGridProps {
  books: Book[]
}

export function RecentBooksGrid({ books }: RecentBooksGridProps) {
  if (books.length === 0) return null

  const [featured, ...rest] = books

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 overflow-hidden"
      style={{ gap: 'clamp(6px, 1.2vw, 10px)', width: '100%', minWidth: 0 }}
    >
      {/* Featured: full-width mobile (span-2 in 2-col), 2×2 desktop (span-2 + row-span-2 in 4-col) */}
      <div
        style={{ gridColumn: 'span 2' }}
        className="sm:row-span-2 anim-fade-up"
      >
        <FeaturedCard book={featured} />
      </div>

      {/* Books 2-5: staggered animation */}
      {rest.slice(0, 4).map((book, i) => (
        <div
          key={book.id}
          className="anim-fade-up"
          style={{ animationDelay: `${(i + 1) * 0.06}s` } as any}
        >
          <SmallCard book={book} />
        </div>
      ))}

      {/* Book 6: span 2, horizontal */}
      {rest[4] && (
        <div
          style={{ gridColumn: 'span 2', animationDelay: '0.30s' } as any}
          className="anim-fade-up"
        >
          <WideCard book={rest[4]} />
        </div>
      )}
    </div>
  )
}
