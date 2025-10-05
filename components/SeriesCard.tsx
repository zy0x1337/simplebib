'use client'

import { Series } from '@/lib/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { BookOpen, ChevronRight, Star, StarHalf, Star as StarEmpty } from 'lucide-react'
import { useState, useEffect } from 'react'
import { SeriesDetailsModal } from './SeriesDetailsModal'

interface SeriesCardProps {
  series: Series
}

function renderStars(rating?: number) {
  if (rating === undefined) return null

  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<Star key={i} className="w-4 h-4 fill-warning text-warning" />)
    } else if (rating >= i - 0.5) {
      stars.push(<StarHalf key={i} className="w-4 h-4 fill-warning text-warning" />)
    } else {
      stars.push(<StarEmpty key={i} className="w-4 h-4 text-base-content/40" />)
    }
  }
  return <div className="flex gap-0.5">{stars}</div>
}

export function SeriesCard({ series }: SeriesCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Bücher in der Serie laden (für z.B. Fortschritt)
  const booksInSeries = useLiveQuery(
    () => db.books.where('seriesId').equals(series.id!).toArray(),
    [series.id]
  )

  // Aktualisiere das Rating jedes Mal, wenn series.overallRating sich ändert
  const [currentRating, setCurrentRating] = useState(series.overallRating)

  useEffect(() => {
    setCurrentRating(series.overallRating)
  }, [series.overallRating])

  const bookCount = booksInSeries?.length ?? 0
  const finishedCount = booksInSeries?.filter((b) => b.status === 'finished').length ?? 0

  return (
    <>
      <div
        className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="card-body p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="card-title text-base">{series.name}</h3>
              <div className="flex items-center gap-2 text-sm text-base-content/60">
                <BookOpen className="w-4 h-4" />
                <span>
                  {finishedCount} / {bookCount} gelesen
                </span>
              </div>
            </div>
            {currentRating !== undefined ? (
              <div className="flex items-center gap-1">
                {renderStars(currentRating)}
                <span className="text-sm text-base-content/70">{`(${currentRating.toFixed(1)})`}</span>
              </div>
            ) : (
              <div className="text-sm text-base-content/70">Keine Bewertung</div>
            )}
          </div>

          {bookCount > 0 && (
            <progress
              className="progress progress-primary w-full"
              value={finishedCount}
              max={bookCount}
            />
          )}
        </div>
      </div>

      <SeriesDetailsModal
        series={series}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
