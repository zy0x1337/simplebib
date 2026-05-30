'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Series } from '@/lib/db'
import { SeriesDetailsModal } from '@/components/SeriesDetailsModal'
import { AddBookToSeriesModal } from '@/components/AddBookToSeriesModal'
import { ChevronRight, Star, StarHalf } from 'lucide-react'

function StarRow({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: '0.125rem' }}>
      {Array.from({ length: 5 }, (_, i) => {
        const n = i + 1
        if (rating >= n)
          return <Star key={n} style={{ width: '0.75rem', height: '0.75rem', fill: 'var(--color-star)', color: 'var(--color-star)' }} />
        if (rating >= n - 0.5)
          return <StarHalf key={n} style={{ width: '0.75rem', height: '0.75rem', fill: 'var(--color-star)', color: 'var(--color-star)' }} />
        return <Star key={n} style={{ width: '0.75rem', height: '0.75rem', color: 'var(--color-text-faint)' }} />
      })}
    </div>
  )
}

/* ─── Standard Series Card ────────────────────────────────────── */

function SeriesGridCard({ series }: { series: Series }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddBookOpen, setIsAddBookOpen] = useState(false)

  const handleOpenAddBook = () => {
    setIsModalOpen(false)
    setIsAddBookOpen(true)
  }

  const booksInSeries = useLiveQuery(
    () => db.books.where('seriesId').equals(series.id!).toArray(),
    [series.id]
  )

  const totalBooks    = booksInSeries?.length ?? 0
  const finishedBooks = booksInSeries?.filter(b => b.status === 'finished').length ?? 0
  const readingBooks  = booksInSeries?.filter(b => b.status === 'reading').length  ?? 0
  const avgRating = booksInSeries && booksInSeries.length > 0
    ? booksInSeries.reduce((s, b) => s + (b.rating ?? 0), 0) / booksInSeries.length
    : 0

  return (
    <>
      <article
        className="book-card"
        onClick={() => setIsModalOpen(true)}
        role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setIsModalOpen(true)}
        aria-label={`Buchreihe: ${series.name}`}
        style={{ padding: 'clamp(0.75rem, 1.5vw, var(--space-4))', display: 'flex', flexDirection: 'column', gap: 'clamp(0.5rem, 1vw, 0.75rem)' }}
        onMouseDown={e => {
          const el = e.currentTarget as HTMLElement
          el.style.background = 'var(--color-surface-accent)'
          setTimeout(() => { el.style.background = '' }, 120)
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
          <div style={{ flexShrink: 0, width: '3rem', textAlign: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.2rem, 3vw, var(--text-xl))', color: 'var(--color-accent)', lineHeight: 1 }}>
              {totalBooks}
            </span>
            <p className="label-caps" style={{ marginTop: '0.1rem' }}>{totalBooks === 1 ? 'Buch' : 'Bücher'}</p>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="card-title-serif" style={{ fontSize: 'clamp(0.8rem, 1.3vw, var(--text-base))', lineHeight: 'var(--leading-snug)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {series.name}
            </h2>
            {avgRating > 0 && (
              <div style={{ marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <StarRow rating={avgRating} />
                <span className="tabular-nums" style={{ fontSize: 'clamp(0.6rem, 1vw, 0.75rem)', color: 'var(--color-text-muted)' }}>{avgRating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <ChevronRight style={{ flexShrink: 0, width: '1rem', height: '1rem', color: 'var(--color-text-faint)', marginTop: '0.2rem' }} />
        </div>

        {totalBooks > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', gap: '1px', height: '0.35rem' }}>
              {Array.from({ length: totalBooks }, (_, i) => {
                const idx = i + 1
                let bg = 'var(--color-surface-2)'
                if (idx <= finishedBooks) bg = 'var(--color-accent)'
                else if (idx <= finishedBooks + readingBooks) bg = 'var(--color-reading)'
                return <div key={i} style={{ flex: 1, borderRadius: 'var(--radius-full)', background: bg }} />
              })}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {finishedBooks > 0 && <span className="label-caps" style={{ color: 'var(--color-accent)' }}>{finishedBooks} gelesen</span>}
              {readingBooks > 0 && <span className="label-caps" style={{ color: 'var(--color-reading)' }}>{readingBooks} aktuell</span>}
              {totalBooks - finishedBooks - readingBooks > 0 && <span className="label-caps">{totalBooks - finishedBooks - readingBooks} offen</span>}
            </div>
          </div>
        )}
      </article>

      <SeriesDetailsModal series={series} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onOpenAddBook={handleOpenAddBook} />
      <AddBookToSeriesModal series={series} isOpen={isAddBookOpen} onClose={() => setIsAddBookOpen(false)} />
    </>
  )
}

/* ─── Featured Series Card (span-2, richer display) ───────────── */

function FeaturedSeriesCard({ series }: { series: Series }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddBookOpen, setIsAddBookOpen] = useState(false)

  const handleOpenAddBook = () => {
    setIsModalOpen(false)
    setIsAddBookOpen(true)
  }

  const booksInSeries = useLiveQuery(
    () => db.books.where('seriesId').equals(series.id!).toArray(),
    [series.id]
  )

  const totalBooks    = booksInSeries?.length ?? 0
  const finishedBooks = booksInSeries?.filter(b => b.status === 'finished').length ?? 0
  const readingBooks  = booksInSeries?.filter(b => b.status === 'reading').length  ?? 0
  const unreadBooks   = totalBooks - finishedBooks - readingBooks
  const avgRating = booksInSeries && booksInSeries.length > 0
    ? booksInSeries.reduce((s, b) => s + (b.rating ?? 0), 0) / booksInSeries.length
    : 0

  // Cover stack (up to 3 covers)
  const coverBooks = booksInSeries?.slice(0, 3) ?? []

  return (
    <>
      <article
        onClick={() => setIsModalOpen(true)}
        role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setIsModalOpen(true)}
        aria-label={`Buchreihe: ${series.name}`}
        style={{
          borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          cursor: 'pointer', border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          background: 'var(--color-surface)',
          display: 'flex', flexDirection: 'column',
        }}
        onMouseDown={e => {
          const el = e.currentTarget as HTMLElement
          el.style.background = 'var(--color-surface-accent)'
          setTimeout(() => { el.style.background = '' }, 120)
        }}
      >
        {/* Header area with possible cover stack */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'clamp(var(--space-2), 2vw, var(--space-4))',
          padding: 'clamp(var(--space-2), 2vw, var(--space-4))',
        }}>
          {/* Cover stack or book count */}
          <div style={{ position: 'relative', width: 'clamp(3rem, 6vw, 4rem)', height: 'clamp(4.5rem, 9vw, 6rem)', flexShrink: 0 }}>
            {coverBooks.length > 0 ? (
              <>
                {coverBooks.map((b, i) => {
                  const offset = (coverBooks.length - 1 - i) * 3
                  const rotation = (i - 1) * 3
                  const coverUrl = b.coverType === 'url' ? b.coverUrl : b.coverBlob ? URL.createObjectURL(b.coverBlob) : null
                  return (
                    <div key={b.id} style={{
                      position: 'absolute', top: offset, left: offset,
                      width: `calc(100% - ${offset * 2}px)`, height: `calc(100% - ${offset * 2}px)`,
                      borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                      transform: `rotate(${rotation}deg)`,
                      border: '1px solid var(--color-border)',
                      opacity: i === coverBooks.length - 1 ? 1 : 0.5,
                      zIndex: i + 1,
                      background: 'var(--color-surface-2)',
                    }}>
                      {coverUrl ? (
                        <img src={coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', color: 'var(--color-text-faint)' }}>
                          {b.title.slice(0, 1)}
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, color: 'var(--color-accent)' }}>
                  {totalBooks}
                </span>
              </div>
            )}
          </div>

          {/* Series info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="card-title-serif" style={{
              fontSize: 'clamp(0.9rem, 1.6vw, var(--text-lg))',
              lineHeight: 'var(--leading-snug)',
              overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {series.name}
            </h2>
            {avgRating > 0 && (
              <div style={{ marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <StarRow rating={avgRating} />
                <span className="tabular-nums" style={{ fontSize: 'clamp(0.65rem, 1vw, 0.8rem)', color: 'var(--color-text-muted)' }}>{avgRating.toFixed(1)}</span>
              </div>
            )}
            <div style={{ marginTop: '0.4rem', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {finishedBooks > 0 && <span className="label-caps" style={{ color: 'var(--color-accent)' }}>{finishedBooks} gelesen</span>}
              {readingBooks > 0 && <span className="label-caps" style={{ color: 'var(--color-reading)' }}>{readingBooks} aktuell</span>}
              {unreadBooks > 0 && <span className="label-caps">{unreadBooks} offen</span>}
            </div>
          </div>

          <ChevronRight style={{ flexShrink: 0, width: '1rem', height: '1rem', color: 'var(--color-text-faint)' }} />
        </div>

        {/* Progress bar */}
        {totalBooks > 0 && (
          <div style={{ padding: '0 clamp(var(--space-2), 2vw, var(--space-4)) clamp(var(--space-2), 2vw, var(--space-4))' }}>
            <div style={{ display: 'flex', gap: '1px', height: '0.4rem', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              {finishedBooks > 0 && <div style={{ width: `${(finishedBooks / totalBooks) * 100}%`, background: 'var(--color-accent)', transition: 'width 0.6s ease' }} />}
              {readingBooks > 0 && <div style={{ width: `${(readingBooks / totalBooks) * 100}%`, background: 'var(--color-reading)', transition: 'width 0.6s ease' }} />}
              {unreadBooks > 0 && <div style={{ flex: 1, background: 'var(--color-surface-2)' }} />}
            </div>
          </div>
        )}
      </article>

      <SeriesDetailsModal series={series} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onOpenAddBook={handleOpenAddBook} />
      <AddBookToSeriesModal series={series} isOpen={isAddBookOpen} onClose={() => setIsAddBookOpen(false)} />
    </>
  )
}

/* ─── Bento Series Grid ─────────────────────────────────────────
   First 1-2 series get featured (span 2), rest span 1.
   Mobile: featured = full width, rest = 1-col
   Desktop: 4-col alternating
─────────────────────────────────────────────────────────────────── */

interface BentoSeriesGridProps {
  series: Series[]
}

export function BentoSeriesGrid({ series }: BentoSeriesGridProps) {
  if (series.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-8) 0', textAlign: 'center' }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true" style={{ color: 'var(--color-text-faint)' }}>
          <rect x="4" y="8" width="8" height="24" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="16" y="6" width="8" height="28" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="28" y="10" width="8" height="22" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'var(--text-base)', color: 'var(--color-text-faint)' }}>Keine Treffer</p>
      </div>
    )
  }

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 overflow-hidden"
      style={{ gap: 'clamp(6px, 1.2vw, 10px)', width: '100%', minWidth: 0 }}
    >
      {series.map((s, i) => {
        // First item always featured, every 6th after that
        const isFeatured = i === 0 || (i > 0 && i % 6 === 0)
        return (
          <div
            key={s.id}
            className="anim-fade-up"
            style={{
              gridColumn: isFeatured ? 'span 2' : 'span 1',
              animationDelay: `${Math.min(i * 0.04, 0.4)}s`,
            } as any}
          >
            {isFeatured
              ? <FeaturedSeriesCard series={s} />
              : <SeriesGridCard series={s} />
            }
          </div>
        )
      })}
    </div>
  )
}
