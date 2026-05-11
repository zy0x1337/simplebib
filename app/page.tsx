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
import { BookPlus, Library, Search, BookOpen } from 'lucide-react'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'books' | 'series'>('books')
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false)
  const [sortedSeries, setSortedSeries] = useState<Series[]>([])
  const [preFillBookData, setPreFillBookData] = useState<{ title: string; authors: string; coverUrl: string } | null>(null)
  const [showSearch, setShowSearch] = useState(false)

  const allBooks  = useLiveQuery(() => db.books.toArray())
  const allSeries = useLiveQuery(() => db.series.toArray())

  useEffect(() => {
    if (!allSeries) return
    const sorted = [...allSeries].sort((a, b) => {
      if (b.overallRating === undefined) return -1
      if (a.overallRating === undefined) return  1
      return b.overallRating - a.overallRating
    })
    setSortedSeries(sorted)
  }, [allSeries])

  const standaloneBooks = allBooks?.filter(b => !b.seriesId)

  function handleBookSelect(book: { title: string; authors: string; coverUrl: string }) {
    setPreFillBookData(book)
    setShowSearch(false)
  }

  /* ── Loading ───────────────────────────────────────────── */
  if (!allBooks || !allSeries) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  /* ── Empty State ───────────────────────────────────────── */
  if (allBooks.length === 0 && allSeries.length === 0) {
    return (
      <div className="min-h-screen bg-base-200 anim-fade-in">
        <Header />
        <div className="container mx-auto px-4 py-12 page-content">
          <div className="text-center max-w-sm mx-auto">
            <div className="mb-6 anim-scale-in">
              <BookPlus className="w-20 h-20 mx-auto mb-5 text-base-content/25" />
            </div>
            <h2 className="font-display text-2xl font-semibold italic mb-2 text-base-content">
              Willkommen in YunoBib
            </h2>
            <p className="text-base-content/60 mb-8 text-sm leading-relaxed">
              Füge dein erstes Buch hinzu oder erstelle eine Buchreihe.
            </p>
            <div className="mb-6 anim-fade-up delay-1">
              <BookSearch onBookSelect={handleBookSelect} />
            </div>
            <div className="flex gap-3 justify-center anim-fade-up delay-2">
              <AddBookButton />
              <button
                className="btn-bib-ghost border border-base-content/12 gap-2"
                onClick={() => setIsSeriesModalOpen(true)}
              >
                <Library className="w-4 h-4" />
                Buchreihe
              </button>
            </div>
          </div>
        </div>
        <AddSeriesModal isOpen={isSeriesModalOpen} onClose={() => setIsSeriesModalOpen(false)} />
        {preFillBookData && (
          <AddBookModal isOpen={true} preFill={preFillBookData} onClose={() => setPreFillBookData(null)} />
        )}
      </div>
    )
  }

  /* ── Main View ──────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-base-200">
      <Header />

      <div className="container mx-auto px-3 sm:px-4 pt-4 pb-2 page-content">

        {/* ── Desktop Search (versteckt auf Mobile — über Bottom-Nav Suche-Tab) */}
        <div className="hidden sm:block mb-5">
          <BookSearch onBookSelect={handleBookSelect} />
        </div>

        {/* ── Mobile Search (einblendbar über Bottom-Nav) */}
        {showSearch && (
          <div className="sm:hidden mb-4 anim-fade-up">
            <BookSearch onBookSelect={handleBookSelect} />
          </div>
        )}

        {preFillBookData && (
          <AddBookModal isOpen={true} preFill={preFillBookData} onClose={() => setPreFillBookData(null)} />
        )}

        {/* ── Tabs */}
        <div className="tabs tabs-boxed mb-5 bg-base-100 p-1 shadow-sm inline-flex w-full sm:w-auto">
          <a
            className={`tab flex-1 sm:flex-none sm:min-w-[140px] text-sm ${
              activeTab === 'books' ? 'tab-active' : ''
            }`}
            onClick={() => setActiveTab('books')}
          >
            <span className="font-medium">Bücher</span>
            <span className="badge badge-sm badge-ghost ml-2">{standaloneBooks?.length ?? 0}</span>
          </a>
          <a
            className={`tab flex-1 sm:flex-none sm:min-w-[140px] text-sm ${
              activeTab === 'series' ? 'tab-active' : ''
            }`}
            onClick={() => setActiveTab('series')}
          >
            <span className="font-medium">Reihen</span>
            <span className="badge badge-sm badge-ghost ml-2">{sortedSeries.length}</span>
          </a>
        </div>

        {/* ── Books Grid */}
        {activeTab === 'books' ? (
          standaloneBooks && standaloneBooks.length > 0 ? (
            /*
              Mobile: 2 Spalten (wie App Store / Play Store)
              Tablet: 3 Spalten
              Desktop: 4 Spalten
            */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
              {standaloneBooks.map((book, index) => (
                <div
                  key={book.id}
                  className="stagger-animation"
                  style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s` }}
                >
                  <BookCard book={book} viewMode="grid" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-base-100 rounded-xl">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-base-content/25" />
              <p className="text-base-content/50 text-sm">
                Keine Einzelbücher. Alle Bücher sind in Reihen.
              </p>
            </div>
          )
        ) : sortedSeries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {sortedSeries.map((series, index) => (
              <div
                key={series.id}
                className="stagger-animation"
                style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s` }}
              >
                <SeriesCard series={series} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-base-100 rounded-xl">
            <Library className="w-12 h-12 mx-auto mb-3 text-base-content/25" />
            <p className="text-base-content/50 text-sm mb-5">Noch keine Buchreihen</p>
            <button
              className="btn-bib-primary gap-2"
              onClick={() => setIsSeriesModalOpen(true)}
            >
              <Library className="w-4 h-4" />
              Erste Reihe erstellen
            </button>
          </div>
        )}
      </div>

      {/* ── Desktop FABs (nur ab sm) */}
      <div className="hidden sm:flex fixed bottom-6 right-6 flex-col gap-3 z-40">
        {activeTab === 'series' && (
          <button
            className="btn btn-circle btn-lg shadow-lg hover:shadow-xl transition-all
                       hover:scale-105 active:scale-95"
            onClick={() => setIsSeriesModalOpen(true)}
            aria-label="Buchreihe erstellen"
          >
            <Library className="w-6 h-6" />
          </button>
        )}
        <AddBookButton />
      </div>

      {/* ── Mobile Bottom Navigation */}
      <nav className="bottom-nav sm:hidden" aria-label="Hauptnavigation">
        <button
          className={`bottom-nav-item ${activeTab === 'books' ? 'active' : ''}`}
          onClick={() => { setActiveTab('books'); setShowSearch(false) }}
          aria-label="Bücher"
        >
          <BookOpen className="w-5 h-5" />
          <span>Bücher</span>
        </button>

        <button
          className={`bottom-nav-item ${showSearch ? 'active' : ''}`}
          onClick={() => {
            setShowSearch(s => !s)
            // Beim Öffnen der Suche: kein Tab-Wechsel
          }}
          aria-label="Suche"
        >
          <Search className="w-5 h-5" />
          <span>Suche</span>
        </button>

        <button
          className={`bottom-nav-item ${activeTab === 'series' ? 'active' : ''}`}
          onClick={() => { setActiveTab('series'); setShowSearch(false) }}
          aria-label="Reihen"
        >
          <Library className="w-5 h-5" />
          <span>Reihen</span>
        </button>

        <button
          className="bottom-nav-item"
          onClick={() => {
            // AddBookButton-Logik: Modal öffnen
            // Wir triggern den AddBookButton-Click indirekt über einen Custom Event
            document.dispatchEvent(new CustomEvent('yuno:add-book'))
          }}
          aria-label="Buch hinzufügen"
        >
          <BookPlus className="w-5 h-5" />
          <span>Hinzufügen</span>
        </button>
      </nav>

      <AddSeriesModal isOpen={isSeriesModalOpen} onClose={() => setIsSeriesModalOpen(false)} />
    </div>
  )
}
