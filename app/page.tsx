'use client'

import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Series } from '@/lib/db'
import { BookSearch } from '@/components/BookSearch'
import { AddBookModal } from '@/components/AddBookModal'
import { Header } from '@/components/Header'
import { BookCard } from '@/components/BookCard'
import { SeriesCard } from '@/components/SeriesCard'
import { AddBookButton } from '@/components/AddBookButton'
import { AddSeriesModal } from '@/components/AddSeriesModal'
import { BookPlus, Library } from 'lucide-react'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'books' | 'series'>('books')
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false)
  const [sortedSeries, setSortedSeries] = useState<Series[]>([])
  const [preFillBookData, setPreFillBookData] = useState<{ title: string; authors: string; coverUrl: string } | null>(null)

  const allBooks = useLiveQuery(() => db.books.toArray())
  const allSeries = useLiveQuery(() => db.series.toArray())

  useEffect(() => {
    if (!allSeries) return
    const sorted = [...allSeries].sort((a, b) => {
      if (b.overallRating === undefined) return -1
      if (a.overallRating === undefined) return 1
      return b.overallRating - a.overallRating
    })
    setSortedSeries(sorted)
  }, [allSeries])

  const standaloneBooks = allBooks?.filter((book) => !book.seriesId)

  function handleBookSelect(book: { title: string; authors: string; coverUrl: string }) {
    setPreFillBookData(book)
  }

  if (!allBooks || !allSeries) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  if (allBooks.length === 0 && allSeries.length === 0) {
    return (
      <div className="min-h-screen bg-base-200 animate-fade-in">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-8 animate-scale-in">
              <BookPlus className="w-24 h-24 mx-auto mb-6 text-base-content/30" />
            </div>
            <h2 className="text-3xl font-display font-bold mb-3 text-base-content">
              Willkommen in YunoBib
            </h2>
            <p className="text-base-content/70 mb-8 text-lg">
              Dein Premium Buchjournal 2026 – füge das erste Buch hinzu oder erstelle eine Buchreihe!
            </p>

            <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <BookSearch onBookSelect={handleBookSelect} />
            </div>

            <div className="flex gap-3 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <AddBookButton />
              <button
                className="btn btn-outline gap-2"
                onClick={() => setIsSeriesModalOpen(true)}
              >
                <Library className="w-5 h-5" />
                Buchreihe erstellen
              </button>
            </div>
          </div>
        </div>
        <AddSeriesModal isOpen={isSeriesModalOpen} onClose={() => setIsSeriesModalOpen(false)} />
        {preFillBookData && (
          <AddBookModal
            isOpen={true}
            preFill={preFillBookData}
            onClose={() => setPreFillBookData(null)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 animate-slide-down">
          <BookSearch onBookSelect={handleBookSelect} />
        </div>

        {preFillBookData && (
          <AddBookModal
            isOpen={true}
            preFill={preFillBookData}
            onClose={() => setPreFillBookData(null)}
          />
        )}

        <div className="tabs tabs-boxed mb-8 bg-base-100 p-1 shadow-sm inline-flex">
          <a
            className={`tab flex-1 sm:flex-none min-w-[140px] ${activeTab === 'books' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('books')}
          >
            <span className="font-medium">Einzelbücher</span>
            <span className="badge badge-sm badge-ghost ml-2">{standaloneBooks?.length ?? 0}</span>
          </a>
          <a
            className={`tab flex-1 sm:flex-none min-w-[140px] ${activeTab === 'series' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('series')}
          >
            <span className="font-medium">Buchreihen</span>
            <span className="badge badge-sm badge-ghost ml-2">{sortedSeries.length}</span>
          </a>
        </div>

        {activeTab === 'books' ? (
          standaloneBooks && standaloneBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {standaloneBooks.map((book, index) => (
                <div 
                  key={book.id} 
                  className="stagger-animation"
                  style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s` }}
                >
                  <BookCard key={book.id} book={book} viewMode="grid" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-base-100 rounded-xl shadow-sm">
              <Library className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
              <p className="text-base-content/60 text-lg">
                Keine Einzelbücher. Alle Bücher sind in Reihen organisiert.
              </p>
            </div>
          )
        ) : sortedSeries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedSeries.map((series, index) => (
              <div 
                key={series.id}
                className="stagger-animation"
                style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s` }}
              >
                <SeriesCard key={series.id} series={series} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-base-100 rounded-xl shadow-sm">
            <Library className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
            <p className="text-base-content/60 mb-6 text-lg">Noch keine Buchreihen</p>
            <button
              className="btn btn-primary gap-2"
              onClick={() => setIsSeriesModalOpen(true)}
            >
              <Library className="w-5 h-5" />
              Erste Reihe erstellen
            </button>
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        {activeTab === 'series' && (
          <button
            className="btn btn-circle btn-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            onClick={() => setIsSeriesModalOpen(true)}
          >
            <Library className="w-6 h-6" />
          </button>
        )}
        <AddBookButton />
      </div>

      <AddSeriesModal isOpen={isSeriesModalOpen} onClose={() => setIsSeriesModalOpen(false)} />
    </div>
  )
}