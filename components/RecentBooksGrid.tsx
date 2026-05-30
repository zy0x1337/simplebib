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

/* ─── Featured Card ───────────────────────────────────────────── */

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
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          background: spine.bg,
          height: '100%',
          minHeight: 'clamp(180px, 40vw, 280px)',
        }}
        onMouseDown={e => {
          const el = e.currentTarget as HTMLElement
          el.style.filter = 'brightness(0.92)'
          setTimeout(() => { el.style.filter = '' }, 120)
        }}
      >
        {/* Cover image */}
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
              fontSize: 'clamp(1rem, 3vw, 2.5rem)',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 300,
              textAlign: 'center',
              padding: 'var(--space-3)',
              lineHeight: 1.2,
            }}>
              {book.title}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.12) 55%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          padding: 'clamp(var(--space-2), 3vw, var(--space-5))',
          color: '#fff',
        }}>
          {/* Status pill */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            padding: '0.125rem 0.45rem',
            borderRadius: 'var(--radius-full)',
            fontSize: 'clamp(0.55rem, 1.2vw, var(--text-xs))',
            fontWeight: 600,
            letterSpacing: 'var(--tracking-widest)',
            textTransform: 'uppercase',
            background: 'rgba(255,255,255,0.14)',
            backdropFilter: 'blur(4px)',
            marginBottom: 'var(--space-1)',
          }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor', opacity: 0.7 }} />
            {STATUS_LABEL[book.status]}
          </span>

          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(var(--text-sm), 2.5vw, var(--text-lg))',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-tight)',
            marginBottom: '0.125rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {book.title}
          </h3>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: 'clamp(0.6rem, 1.1vw, var(--text-xs))',
            opacity: 0.75,
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
                <Star style={{ width: '0.7rem', height: '0.7rem', fill: 'var(--color-star)', color: 'var(--color-star)' }} />
                {book.rating}
              </span>
            ) : null}
          </div>

          <p style={{ fontSize: 'clamp(0.55rem, 1vw, 0.65rem)', opacity: 0.55, marginTop: '0.15rem' }}>
            {relativeDays(book.dateAdded)}
          </p>
        </div>
      </article>

      <BookDetailsModal book={book} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

/* ─── Small Card ──────────────────────────────────────────────── */

function SmallCard({ book }: { book: Book }) {
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
              loading="lazy" />
          ) : (
            <div style={{
              width: '100%', height: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: spine.bg,
            }}>
              <span style={{
                color: spine.text, opacity: 0.6,
                fontSize: 'clamp(0.4rem, 1vw, 0.5rem)', fontWeight: 500,
                textAlign: 'center', padding: '0.25rem', lineHeight: 1.2,
                writingMode: 'vertical-rl', transform: 'rotate(180deg)',
                fontFamily: 'var(--font-body)',
              }}>
                {book.title}
              </span>
            </div>
          )}
          {book.status !== 'unread' && (
            <div style={{ position: 'absolute', top: '0.25rem', left: '0.25rem' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.15rem',
                padding: '0.08rem 0.35rem',
                borderRadius: 'var(--radius-full)',
                fontSize: 'clamp(0.45rem, 0.9vw, 0.55rem)',
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
        <div style={{ padding: 'clamp(var(--space-1), 1.5vw, var(--space-2))' }}>
          <p style={{
            fontSize: 'clamp(0.6rem, 1.2vw, var(--text-xs))', fontWeight: 500,
            lineHeight: 'var(--leading-snug)',
            overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', color: 'var(--color-text)',
          }}>
            {book.title}
          </p>
          <p style={{
            fontSize: 'clamp(0.5rem, 1vw, 0.6rem)', color: 'var(--color-text-muted)',
            letterSpacing: 'var(--tracking-wide)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            marginTop: '0.125rem',
          }}>
            {book.author}
          </p>
        </div>
      </article>

      <BookDetailsModal book={book} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

/* ─── Wide Horizontal Card (Book #6) ──────────────────────────── */

function WideCard({ book }: { book: Book }) {
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
        style={{ display: 'flex', alignItems: 'stretch', height: '100%' }}
      >
        <div style={{
          width: 'clamp(3rem, 6vw, 4rem)', flexShrink: 0,
          borderTopLeftRadius: 'var(--radius-lg)',
          borderBottomLeftRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}>
          {coverSrc ? (
            <img src={coverSrc} alt={book.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '100%' }}
              loading="lazy" />
          ) : (
            <div style={{
              width: '100%', height: '100%', minHeight: '4.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: spine.bg,
            }}>
              <span style={{
                color: spine.text, opacity: 0.6,
                fontSize: 'clamp(0.4rem, 1vw, 0.5rem)',
                fontWeight: 500, textAlign: 'center',
                padding: '0.25rem', lineHeight: 1.2,
                fontFamily: 'var(--font-body)',
              }}>
                {book.title}
              </span>
            </div>
          )}
        </div>

        <div style={{
          flex: 1, minWidth: 0,
          padding: 'clamp(var(--space-1), 2vw, var(--space-3))',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', gap: '0.125rem',
        }}>
          <p style={{
            fontSize: 'clamp(0.6rem, 1.2vw, var(--text-xs))', fontWeight: 500,
            lineHeight: 'var(--leading-snug)', color: 'var(--color-text)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {book.title}
          </p>
          <p style={{
            fontSize: 'clamp(0.5rem, 1vw, 0.6rem)', color: 'var(--color-text-muted)',
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
              padding: '0.06rem 0.3rem',
              borderRadius: 'var(--radius-full)',
              fontSize: 'clamp(0.45rem, 0.9vw, 0.55rem)', fontWeight: 600,
              letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase',
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
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.12rem', fontSize: 'clamp(0.5rem, 1vw, 0.6rem)', color: 'var(--color-star)' }}>
                <Star style={{ width: '0.55rem', height: '0.55rem', fill: 'var(--color-star)' }} />
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

/* ─── Bento Grid ──────────────────────────────────────────────── */

interface RecentBooksGridProps {
  books: Book[]
}

export function RecentBooksGrid({ books }: RecentBooksGridProps) {
  if (books.length === 0) return null

  const [featured, ...rest] = books

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 gap-[var(--space-2)]"
      style={{ overflow: 'hidden' }}
    >
      {/* Featured: full width on mobile (span 2 in 2-col grid), 2×2 on desktop */}
      <div
        style={{ gridColumn: 'span 2' }}
        className="sm:row-span-2 anim-fade-up"
      >
        <FeaturedCard book={featured} />
      </div>

      {/* Books 2-5 */}
      {rest.slice(0, 4).map((book, i) => (
        <div
          key={book.id}
          className="anim-fade-up"
          style={{ animationDelay: `${(i + 1) * 0.05}s` } as any}
        >
          <SmallCard book={book} />
        </div>
      ))}

      {/* Book 6: full width (span 2), horizontal layout */}
      {rest[4] && (
        <div
          style={{ gridColumn: 'span 2', animationDelay: '0.25s' } as any}
          className="anim-fade-up"
        >
          <WideCard book={rest[4]} />
        </div>
      )}
    </div>
  )
}
