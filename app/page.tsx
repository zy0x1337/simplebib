// 🎯 PWA-Pattern: Main View mit Books & Series
// ✅ TypeScript Strict Mode
// ⚡ Performance-Critical: Lazy Loading
// 📱 App-like UX: Mobile-Optimized

'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { BookCard } from '@/components/BookCard'
import { SeriesCard } from '@/components/SeriesCard'
import { AddBookButton } from '@/components/AddBookButton'
import { Header } from '@/components/Header'
import { BookPlus, Library, Grid3x3, List } from 'lucide-react'
import { AddSeriesModal } from '@/components/AddSeriesModal'

export default function HomePage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState<'books' | 'series'>('books')
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false)

  // Live Queries
  const allBooks = useLiveQuery(() => db.books.toArray())
  const allSeries = useLiveQuery(() => db.series.toArray())

  // Filter books without series for books tab
  const standaloneBooks = allBooks?.filter(book => !book.seriesId)

  // Loading State
  if (!allBooks || !allSeries) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  // Empty State
  if (allBooks.length === 0 && allSeries.length === 0) {
    return (
      <div className="min-h-screen bg-base-200">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <BookPlus className="w-24 h-24 mx-auto mb-6 text-base-content/30" />
            <h2 className="text-2xl font-bold mb-2">Noch keine Bücher</h2>
            <p className="text-base-content/60 mb-8">
              Füge dein erstes Buch hinzu oder erstelle eine Buchreihe!
            </p>
            <div className="flex gap-2 justify-center">
              <AddBookButton />
              <button
                className="btn btn-outline"
                onClick={() => setIsSeriesModalOpen(true)}
              >
                <Library className="w-5 h-5 mr-2" />
                Buchreihe erstellen
              </button>
            </div>
          </div>
        </div>
        <AddSeriesModal
          isOpen={isSeriesModalOpen}
          onClose={() => setIsSeriesModalOpen(false)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="tabs tabs-boxed mb-6 bg-base-100 p-1">
          <a
            className={`tab flex-1 ${activeTab === 'books' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('books')}
          >
            Einzelbücher ({standaloneBooks?.length || 0})
          </a>
          <a
            className={`tab flex-1 ${activeTab === 'series' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('series')}
          >
            Buchreihen ({allSeries.length})
          </a>
        </div>

        {/* View Controls (nur für Books) */}
        {activeTab === 'books' && standaloneBooks && standaloneBooks.length > 0 && (
          <div className="flex justify-end gap-2 mb-6">
            <button
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        {activeTab === 'books' ? (
          // Books View
          standaloneBooks && standaloneBooks.length > 0 ? (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
                : 'flex flex-col gap-4'
            }>
              {standaloneBooks.map((book) => (
                <BookCard key={book.id} book={book} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-base-content/60">
              <p>Keine Einzelbücher. Alle Bücher sind in Reihen organisiert.</p>
            </div>
          )
        ) : (
          // Series View
          allSeries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allSeries.map((series) => (
                <SeriesCard key={series.id} series={series} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Library className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
              <p className="text-base-content/60 mb-4">Noch keine Buchreihen</p>
              <button
                className="btn btn-primary"
                onClick={() => setIsSeriesModalOpen(true)}
              >
                Erste Reihe erstellen
              </button>
            </div>
          )
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        {activeTab === 'series' && (
          <button
            className="btn btn-circle btn-lg shadow-lg"
            onClick={() => setIsSeriesModalOpen(true)}
          >
            <Library className="w-6 h-6" />
          </button>
        )}
        <AddBookButton />
      </div>

      <AddSeriesModal
        isOpen={isSeriesModalOpen}
        onClose={() => setIsSeriesModalOpen(false)}
      />
    </div>
  )
}
