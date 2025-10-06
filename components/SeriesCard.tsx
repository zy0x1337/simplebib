'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Series } from '@/lib/db'
import { BookOpen, ChevronRight, Star, StarHalf, Star as StarEmpty } from 'lucide-react'
import { SeriesDetailsModal } from './SeriesDetailsModal'

interface SeriesCardProps {
  series: Series
}

function renderStars(rating?: number) {
  if (rating === undefined || rating === 0) return null
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

  // Bücher in der Serie laden
  const booksInSeries = useLiveQuery(
    () => db.books.where('seriesId').equals(series.id!).toArray(),
    [series.id]
  )

  // Durchschnittsbewertung berechnen
  const averageRating = booksInSeries && booksInSeries.length > 0
    ? booksInSeries.reduce((sum, book) => sum + (book.rating || 0), 0) / booksInSeries.length
    : 0

  // Fortschritt berechnen
  const totalBooks = booksInSeries?.length || 0
  const finishedBooks = booksInSeries?.filter(b => b.status === 'finished').length || 0
  const readingBooks = booksInSeries?.filter(b => b.status === 'reading').length || 0

  return (
    <>
      <div
        className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="card-body">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="card-title text-lg mb-2">{series.name}</h2>
              
              {/* Bücher Anzahl */}
              <div className="flex items-center gap-2 text-sm text-base-content/70 mb-2">
                <BookOpen className="w-4 h-4" />
                <span>{totalBooks} {totalBooks === 1 ? 'Buch' : 'Bücher'}</span>
              </div>

              {/* Fortschritt */}
              {totalBooks > 0 && (
                <div className="text-sm text-base-content/70 mb-2">
                  <span className="font-semibold text-success">{finishedBooks}</span> gelesen
                  {readingBooks > 0 && (
                    <>, <span className="font-semibold text-info">{readingBooks}</span> in Bearbeitung</>
                  )}
                </div>
              )}

              {/* Bewertung */}
              {averageRating > 0 && (
                <div className="flex items-center gap-2">
                  {renderStars(averageRating)}
                  <span className="text-sm text-base-content/70">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
            
            <ChevronRight className="w-5 h-5 text-base-content/40" />
          </div>
        </div>
      </div>

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
