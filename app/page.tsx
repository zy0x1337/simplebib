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
  const [activeTab, setActiveTab]           = useState<'books' | 'series'>('books')
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false)
  const [sortedSeries, setSortedSeries]     = useState<Series[]>([])
  const [preFillBookData, setPreFillBookData] = useState<{ title: string; authors: string; coverUrl: string } | null>(null)
  const [showSearch, setShowSearch]         = useState(false)

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

  /* ── Loading ─────────────────────────────────────────────────── */
  if (!allBooks || !allSeries) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  /* ── Empty State (erste Öffnung) ─────────────────────────────────────── */
  if (allBooks.length === 0 && allSeries.length === 0) {
    return (
      <div className="min-h-screen bg-base-200 anim-fade-in">
        <Header />
        <div className="container mx-auto px-5 py-14 page-content">
          <div className="max-w-xs mx-auto flex flex-col items-center text-center gap-6">

            {/* Ornamentale Bücherstapel-SVG statt generischem Icon */}
            <div className="anim-scale-in">
              <svg width="72" height="72" viewBox="0 0 72 72" fill="none"
                aria-hidden="true" className="mx-auto">
                {/* Buch 1 — geneigt, unten */}
                <rect x="10" y="44" width="38" height="10" rx="2"
                  fill="none" stroke="currentColor" strokeWidth="1.5"
                  className="text-primary/40"
                  transform="rotate(-4 10 44)"
                />
                {/* Buch 2 — gerade, mitte */}
                <rect x="14" y="30" width="36" height="12" rx="2"
                  fill="none" stroke="currentColor" strokeWidth="1.5"
                  className="text-primary/60"
                />
                {/* Buch 3 — leicht geneigt, oben */}
                <rect x="16" y="16" width="34" height="12" rx="2"
                  fill="none" stroke="currentColor" strokeWidth="1.5"
                  className="text-primary"
                  transform="rotate(3 16 16)"
                />
                {/* Lesezeichen */}
                <path d="M48 16 L48 10 L52 12 L56 10 L56 16"
                  stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"
                  className="text-secondary"
                />
              </svg>
            </div>

            <div className="anim-fade-up delay-1">
              <h2 className="font-display text-2xl italic mb-2 leading-tight">
                Deine Bibliothek
              </h2>
              <p className="text-sm text-base-content/55 leading-relaxed">
                Noch leer — aber das ändert sich gleich.
              </p>
            </div>

            <div className="w-full anim-fade-up delay-2">
              <BookSearch onBookSelect={handleBookSelect} />
            </div>

            <div className="flex gap-3 justify-center anim-fade-up delay-3">
              <AddBookButton />
              <button
                className="btn-bib-ghost border border-base-content/12 gap-2"
                onClick={() => setIsSeriesModalOpen(true)}
              >
                <Library className="w-4 h-4" />
                Reihe anlegen
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

  /* ── Main View ──────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-base-200">
      <Header />

      <div className="container mx-auto px-3 sm:px-4 pt-4 pb-2 page-content">

        {/* ── Desktop Suche */}
        <div className="hidden sm:block mb-5">
          <BookSearch onBookSelect={handleBookSelect} />
        </div>

        {/* ── Mobile Suche (einblendbar) */}
        {showSearch && (
          <div className="sm:hidden mb-4 anim-fade-up">
            <BookSearch onBookSelect={handleBookSelect} />
          </div>
        )}

        {preFillBookData && (
          <AddBookModal isOpen={true} preFill={preFillBookData} onClose={() => setPreFillBookData(null)} />
        )}

        {/* ── Tabs — bib-tab statt DaisyUI tabs-boxed */}
        <div className="bib-tabs">
          <button
            className={`bib-tab ${activeTab === 'books' ? 'active' : ''}`}
            onClick={() => setActiveTab('books')}
          >
            Bücher
            <span className="bib-tab-count">
              {standaloneBooks?.length ?? 0}
            </span>
          </button>
          <button
            className={`bib-tab ${activeTab === 'series' ? 'active' : ''}`}
            onClick={() => setActiveTab('series')}
          >
            Reihen
            <span className="bib-tab-count">
              {sortedSeries.length}
            </span>
          </button>
        </div>

        {/* ── Bücher-Grid */}
        {activeTab === 'books' ? (
          standaloneBooks && standaloneBooks.length > 0 ? (
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
            /* Inline-Empty-State Bücher */
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
                aria-hidden="true" className="text-base-content/20">
                <rect x="6" y="5" width="22" height="30" rx="2"
                  stroke="currentColor" strokeWidth="1.5" />
                <line x1="6" y1="12" x2="28" y2="12"
                  stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
                <line x1="10" y1="18" x2="24" y2="18"
                  stroke="currentColor" strokeWidth="1" />
                <line x1="10" y1="22" x2="20" y2="22"
                  stroke="currentColor" strokeWidth="1" />
              </svg>
              <p className="font-display italic text-base text-base-content/40">
                Noch keine Einzelbücher
              </p>
              <p className="text-xs text-base-content/30">
                Alle Bücher sind in Reihen — oder füge jetzt eines hinzu.
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
          /* Inline-Empty-State Reihen */
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
              aria-hidden="true" className="text-base-content/20">
              {/* 3 Bücher nebeneinander */}
              <rect x="4"  y="8" width="8" height="24" rx="1.5"
                stroke="currentColor" strokeWidth="1.5" />
              <rect x="16" y="6" width="8" height="28" rx="1.5"
                stroke="currentColor" strokeWidth="1.5" />
              <rect x="28" y="10" width="8" height="22" rx="1.5"
                stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <p className="font-display italic text-base text-base-content/40">
              Noch keine Reihen
            </p>
            <button
              className="btn-bib-primary mt-1 gap-2 text-sm"
              onClick={() => setIsSeriesModalOpen(true)}
            >
              <Library className="w-4 h-4" />
              Erste Reihe erstellen
            </button>
          </div>
        )}
      </div>

      {/* ── Desktop FABs */}
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
          className={`bottom-nav-item ${activeTab === 'books' && !showSearch ? 'active' : ''}`}
          onClick={() => { setActiveTab('books'); setShowSearch(false) }}
          aria-label="Bücher"
        >
          <BookOpen className="w-5 h-5" />
          <span>Bücher</span>
        </button>

        <button
          className={`bottom-nav-item ${showSearch ? 'active' : ''}`}
          onClick={() => setShowSearch(s => !s)}
          aria-label="Suche"
        >
          <Search className="w-5 h-5" />
          <span>Suche</span>
        </button>

        <button
          className={`bottom-nav-item ${activeTab === 'series' && !showSearch ? 'active' : ''}`}
          onClick={() => { setActiveTab('series'); setShowSearch(false) }}
          aria-label="Reihen"
        >
          <Library className="w-5 h-5" />
          <span>Reihen</span>
        </button>

        <button
          className="bottom-nav-item"
          onClick={() => document.dispatchEvent(new CustomEvent('yuno:add-book'))}
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
