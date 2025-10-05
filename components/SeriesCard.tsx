// 🎯 PWA-Pattern: Series Display Card
// ✅ TypeScript Strict Mode
// 📱 Shows books in series

'use client'

import { Series } from '@/lib/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { BookOpen, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { SeriesDetailsModal } from './SeriesDetailsModal'

interface SeriesCardProps {
  series: Series
}

export function SeriesCard({ series }: SeriesCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Get books in this series
  const booksInSeries = useLiveQuery(
    () => db.books.where('seriesId').equals(series.id!).toArray(),
    [series.id]
  )

  const bookCount = booksInSeries?.length || 0
  const finishedCount = booksInSeries?.filter(b => b.status === 'finished').length || 0

  return (
    <>
      <div
        className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="card-body p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="card-title text-base mb-1">{series.name}</h3>
              <div className="flex items-center gap-2 text-sm text-base-content/60">
                <BookOpen className="w-4 h-4" />
                <span>
                  {finishedCount} / {bookCount} gelesen
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-base-content/40" />
          </div>

          {/* Progress Bar */}
          {bookCount > 0 && (
            <div className="mt-3">
              <progress
                className="progress progress-primary w-full"
                value={finishedCount}
                max={bookCount}
              ></progress>
            </div>
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
