'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Series } from '@/lib/db'
import { ChevronRight, Star, StarHalf } from 'lucide-react'
import { SeriesDetailsModal } from './SeriesDetailsModal'

interface SeriesCardProps {
  series: Series
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const n = i + 1
        if (rating >= n)
          return <Star key={n} className="w-3.5 h-3.5" style={{ fill: 'var(--color-star)', color: 'var(--color-star)' }} />
        if (rating >= n - 0.5)
          return <StarHalf key={n} className="w-3.5 h-3.5" style={{ fill: 'var(--color-star)', color: 'var(--color-star)' }} />
        return <Star key={n} className="w-3.5 h-3.5" style={{ color: 'var(--color-text-faint)' }} />
      })}
    </div>
  )
}

export function SeriesCard({ series }: SeriesCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

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
        className="book-card cursor-pointer group px-5 py-4 flex flex-col gap-4"
        onClick={() => setIsModalOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setIsModalOpen(true)}
        aria-label={`Buchreihe: ${series.name}`}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">

          {/* Book count — big number, no icon-in-circle */}
          <div className="flex-shrink-0 w-12 text-center">
            <span
              className="font-display font-bold leading-none"
              style={{ fontSize: 'var(--text-xl)', color: 'var(--color-accent)' }}
            >
              {totalBooks}
            </span>
            <p className="label-caps mt-0.5">
              {totalBooks === 1 ? 'Buch' : 'Bücher'}
            </p>
          </div>

          {/* Name + avg rating */}
          <div className="flex-1 min-w-0">
            <h2
              className="card-title-serif truncate"
              style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-snug)' }}
            >
              {series.name}
            </h2>
            {avgRating > 0 && (
              <div className="mt-1.5 flex items-center gap-2">
                <StarRow rating={avgRating} />
                <span
                  className="tabular-nums"
                  style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}
                >
                  {avgRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <ChevronRight
            className="flex-shrink-0 w-4 h-4 mt-0.5 transition-all duration-200
                       group-hover:translate-x-0.5"
            style={{ color: 'var(--color-text-faint)' }}
          />
        </div>

        {/* Segmented progress bar */}
        {totalBooks > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-0.5 h-1.5">
              {Array.from({ length: totalBooks }, (_, i) => {
                const idx = i + 1
                let bg = 'var(--color-surface-elevated)'
                if (idx <= finishedBooks)                      bg = 'var(--color-accent)'
                else if (idx <= finishedBooks + readingBooks)  bg = 'var(--color-reading)'
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-full transition-colors duration-300"
                    style={{ background: bg }}
                  />
                )
              })}
            </div>

            <div className="flex items-center gap-3">
              {finishedBooks > 0 && (
                <span className="label-caps" style={{ color: 'var(--color-accent)' }}>
                  {finishedBooks} gelesen
                </span>
              )}
              {readingBooks > 0 && (
                <span className="label-caps" style={{ color: 'var(--color-reading)' }}>
                  {readingBooks} aktuell
                </span>
              )}
              {totalBooks - finishedBooks - readingBooks > 0 && (
                <span className="label-caps">
                  {totalBooks - finishedBooks - readingBooks} offen
                </span>
              )}
            </div>
          </div>
        )}
      </article>

      {isModalOpen && (
        <SeriesDetailsModal
          series={series}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}
