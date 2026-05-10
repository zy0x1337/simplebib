'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Series } from '@/lib/db'
import { BookOpen, ChevronRight, Library as LibraryIcon, Star, StarHalf, Star as StarEmpty } from 'lucide-react'
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
        className="card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="card-body">
          {/* Header with icon and chevron */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <LibraryIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="card-title text-xl font-display font-semibold text-base-content">
                  {series.name}
                </h2>
                <div className="flex items-center gap-2 text-sm text-base-content/60 mt-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{totalBooks} {totalBooks === 1 ? 'Buch' : 'Bücher'} in dieser Reihe</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-base-content/40 group-hover:text-base-content transition-colors" />
          </div>

          {/* Progress section */}
          {totalBooks > 0 && (
            <div className="bg-base-200 rounded-lg p-3 mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-base-content/70">Dein Fortschritt</span>
                <span className="text-sm font-semibold text-primary">
                  {finishedBooks}/{totalBooks}
                </span>
              </div>
              <progress 
                className="progress progress-primary w-full h-2" 
                value={finishedBooks} 
                max={totalBooks}
              ></progress>
              
              <div className="flex gap-4 mt-3 text-xs text-base-content/60">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  {finishedBooks} gelesen
                </span>
                {readingBooks > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-info"></span>
                    {readingBooks} in Bearbeitung
                  </span>
                )}
                {totalBooks - finishedBooks - readingBooks > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-base-300"></span>
                    {totalBooks - finishedBooks - readingBooks} offen
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Rating */}
          {averageRating > 0 && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-base-200">
              <span className="text-sm text-base-content/70">Ø Bewertung:</span>
              {renderStars(averageRating)}
              <span className="text-sm font-medium text-base-content">
                {averageRating.toFixed(1)}
              </span>
            </div>
          )}
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
