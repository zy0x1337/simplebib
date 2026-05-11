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
          return <Star key={n} className="w-3.5 h-3.5 fill-warning text-warning" />
        if (rating >= n - 0.5)
          return <StarHalf key={n} className="w-3.5 h-3.5 fill-warning text-warning" />
        return <Star key={n} className="w-3.5 h-3.5 text-base-content/18" />
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

  const totalBooks   = booksInSeries?.length ?? 0
  const finishedBooks = booksInSeries?.filter(b => b.status === 'finished').length ?? 0
  const readingBooks  = booksInSeries?.filter(b => b.status === 'reading').length  ?? 0
  const progressPct   = totalBooks > 0 ? (finishedBooks / totalBooks) * 100 : 0

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
        {/* Header-Zeile */}
        <div className="flex items-start justify-between gap-3">

          {/* Buchanzahl-Block — Zahl als visuelle Aussage, kein Icon-in-Kreis */}
          <div className="flex-shrink-0 w-12 text-center">
            <span className="font-display text-3xl font-bold leading-none text-primary">
              {totalBooks}
            </span>
            <p className="label-caps mt-0.5">
              {totalBooks === 1 ? 'Buch' : 'Bücher'}
            </p>
          </div>

          {/* Titel + Meta */}
          <div className="flex-1 min-w-0">
            <h2 className="card-title-serif text-base leading-snug truncate
                           group-hover:text-primary transition-colors duration-200">
              {series.name}
            </h2>
            {avgRating > 0 && (
              <div className="mt-1.5 flex items-center gap-2">
                <StarRow rating={avgRating} />
                <span className="text-xs text-base-content/45 tabular-nums">
                  {avgRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <ChevronRight
            className="flex-shrink-0 w-4 h-4 text-base-content/30
                       group-hover:text-base-content/60
                       group-hover:translate-x-0.5
                       transition-all duration-200 mt-0.5"
          />
        </div>

        {/* Fortschritt */}
        {totalBooks > 0 && (
          <div className="flex flex-col gap-2">
            {/* Progress-Track — geteilt in Segmente statt Balken */}
            <div className="flex gap-0.5 h-1.5">
              {Array.from({ length: totalBooks }, (_, i) => {
                const bookIdx = i + 1
                let bg = 'bg-base-300'
                if (bookIdx <= finishedBooks) bg = 'bg-primary'
                else if (bookIdx <= finishedBooks + readingBooks) bg = 'bg-secondary/60'
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-full ${bg} transition-colors duration-300`}
                  />
                )
              })}
            </div>

            {/* Legende */}
            <div className="flex items-center gap-3">
              <span className="label-caps text-primary">
                {finishedBooks} gelesen
              </span>
              {readingBooks > 0 && (
                <span className="label-caps text-secondary">
                  {readingBooks} aktuell
                </span>
              )}
              {totalBooks - finishedBooks - readingBooks > 0 && (
                <span className="label-caps">
                  {totalBooks - finishedBooks - readingBooks} offen
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
