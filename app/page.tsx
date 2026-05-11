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
import { BookPlus, Library, Search, BookOpen, Plus, LibraryBig } from 'lucide-react'

export default function HomePage() {
  const [activeTab, setActiveTab]           = useState<'books' | 'series'>('books')
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false)
  const [isAddBookOpen, setIsAddBookOpen]   = useState(false)
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

  function handleAddTap() {
    if (activeTab === 'series') {
      setIsSeriesModalOpen(true)
    } else {
      setIsAddBookOpen(true)
    }
  }

  /* ── Loading ────────────────────────────────────────────────── */
  if (!allBooks || !allSeries) {
    return (
      <div style={{
        minHeight: '100svh',
        background: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '2rem', height: '2rem',
          borderRadius: '50%',
          border: '2px solid var(--color-border)',
          borderTopColor: 'var(--color-accent)',
          animation: 'spin 0.75s linear infinite',
        }} />
      </div>
    )
  }

  /* ── Empty State ──────────────────────────────────────────── */
  if (allBooks.length === 0 && allSeries.length === 0) {
    return (
      <div style={{ minHeight: '100svh', background: 'var(--color-bg)' }} className="anim-fade-in">
        <Header />
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'var(--space-12) var(--space-5)' }} className="page-content">
          <div style={{ maxWidth: '20rem', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 'var(--space-6)' }}>

            <div className="anim-scale-in">
              <svg width="64" height="64" viewBox="0 0 72 72" fill="none" aria-hidden="true">
                <rect x="10" y="44" width="38" height="10" rx="2"
                  stroke="var(--color-accent)" strokeWidth="1.5" opacity="0.4"
                  transform="rotate(-4 10 44)" />
                <rect x="14" y="30" width="36" height="12" rx="2"
                  stroke="var(--color-accent)" strokeWidth="1.5" opacity="0.6" />
                <rect x="16" y="16" width="34" height="12" rx="2"
                  stroke="var(--color-accent)" strokeWidth="1.5"
                  transform="rotate(3 16 16)" />
                <path d="M48 16 L48 10 L52 12 L56 10 L56 16"
                  stroke="var(--color-star)" strokeWidth="1.3" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="anim-fade-up delay-1">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontStyle: 'italic', fontWeight: 300, marginBottom: 'var(--space-2)', lineHeight: 'var(--leading-tight)', color: 'var(--color-text)' }}>
                Deine Bibliothek
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
                Noch leer — aber das ändert sich gleich.
              </p>
            </div>

            <div style={{ width: '100%' }} className="anim-fade-up delay-2">
              <BookSearch onBookSelect={handleBookSelect} />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }} className="anim-fade-up delay-3">
              <button className="btn-bib-primary" onClick={() => setIsAddBookOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Plus style={{ width: '1rem', height: '1rem' }} />
                Buch hinzufügen
              </button>
              <button
                className="btn-bib-ghost"
                style={{ border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
                onClick={() => setIsSeriesModalOpen(true)}
              >
                <Library style={{ width: '1rem', height: '1rem' }} />
                Reihe anlegen
              </button>
            </div>
          </div>
        </div>

        <AddSeriesModal isOpen={isSeriesModalOpen} onClose={() => setIsSeriesModalOpen(false)} />
        <AddBookModal isOpen={isAddBookOpen} onClose={() => setIsAddBookOpen(false)} />
        {preFillBookData && (
          <AddBookModal isOpen={true} preFill={preFillBookData} onClose={() => setPreFillBookData(null)} />
        )}
      </div>
    )
  }

  /* ── Main View ──────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100svh', background: 'var(--color-bg)' }}>
      <Header />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-4) var(--space-3) var(--space-2)' }} className="page-content">

        {/* Desktop Suche */}
        <div className="hidden sm:block" style={{ marginBottom: 'var(--space-5)' }}>
          <BookSearch onBookSelect={handleBookSelect} />
        </div>

        {/* Mobile Suche */}
        {showSearch && (
          <div className="sm:hidden anim-fade-up" style={{ marginBottom: 'var(--space-4)' }}>
            <BookSearch onBookSelect={handleBookSelect} />
          </div>
        )}

        {preFillBookData && (
          <AddBookModal isOpen={true} preFill={preFillBookData} onClose={() => setPreFillBookData(null)} />
        )}

        {/* Tabs */}
        <div className="bib-tabs">
          <button
            className={`bib-tab ${activeTab === 'books' ? 'active' : ''}`}
            onClick={() => setActiveTab('books')}
          >
            Bücher
            <span className="bib-tab-count">{standaloneBooks?.length ?? 0}</span>
          </button>
          <button
            className={`bib-tab ${activeTab === 'series' ? 'active' : ''}`}
            onClick={() => setActiveTab('series')}
          >
            Reihen
            <span className="bib-tab-count">{sortedSeries.length}</span>
          </button>
        </div>

        {/* Bücher-Grid */}
        {activeTab === 'books' ? (
          standaloneBooks && standaloneBooks.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}
              className="sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            >
              {standaloneBooks.map((book, index) => (
                <div key={book.id} className="anim-fade-up" style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s` }}>
                  <BookCard book={book} viewMode="grid" />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-12) 0', textAlign: 'center' }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true" style={{ color: 'var(--color-text-faint)' }}>
                <rect x="6" y="5" width="22" height="30" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <line x1="6" y1="12" x2="28" y2="12" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
                <line x1="10" y1="18" x2="24" y2="18" stroke="currentColor" strokeWidth="1" />
                <line x1="10" y1="22" x2="20" y2="22" stroke="currentColor" strokeWidth="1" />
              </svg>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'var(--text-base)', color: 'var(--color-text-faint)' }}>
                Noch keine Einzelbücher
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
                Alle Bücher sind in Reihen — oder füge jetzt eines hinzu.
              </p>
            </div>
          )
        ) : sortedSeries.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-3)' }}
            className="sm:grid-cols-2 lg:grid-cols-3"
          >
            {sortedSeries.map((series, index) => (
              <div key={series.id} className="anim-fade-up" style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s` }}>
                <SeriesCard series={series} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-12) 0', textAlign: 'center' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true" style={{ color: 'var(--color-text-faint)' }}>
              <rect x="4"  y="8"  width="8" height="24" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="16" y="6"  width="8" height="28" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="28" y="10" width="8" height="22" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'var(--text-base)', color: 'var(--color-text-faint)' }}>
              Noch keine Reihen
            </p>
            <button
              className="btn-bib-primary"
              style={{ marginTop: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}
              onClick={() => setIsSeriesModalOpen(true)}
            >
              <Library style={{ width: '1rem', height: '1rem' }} />
              Erste Reihe erstellen
            </button>
          </div>
        )}
      </div>

      {/* Desktop FABs */}
      <div className="hidden sm:flex" style={{
        position: 'fixed', bottom: 'var(--space-6)', right: 'var(--space-6)',
        flexDirection: 'column', gap: 'var(--space-3)', zIndex: 40,
      }}>
        {activeTab === 'series' && (
          <button
            className="btn-bib-outline"
            style={{
              width: '3.5rem', height: '3.5rem', borderRadius: 'var(--radius-full)',
              padding: 0, boxShadow: 'var(--shadow-md)',
              background: 'var(--color-surface)',
            }}
            onClick={() => setIsSeriesModalOpen(true)}
            aria-label="Buchreihe erstellen"
          >
            <Library style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        )}
        <AddBookButton />
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav sm:hidden" aria-label="Hauptnavigation">
        <button
          className={`bottom-nav-item ${activeTab === 'books' && !showSearch ? 'active' : ''}`}
          onClick={() => { setActiveTab('books'); setShowSearch(false) }}
          aria-label="Bücher"
        >
          <BookOpen style={{ width: '1.25rem', height: '1.25rem' }} />
          <span>Bücher</span>
        </button>

        <button
          className={`bottom-nav-item ${showSearch ? 'active' : ''}`}
          onClick={() => setShowSearch(s => !s)}
          aria-label="Suche"
        >
          <Search style={{ width: '1.25rem', height: '1.25rem' }} />
          <span>Suche</span>
        </button>

        <button
          className={`bottom-nav-item ${activeTab === 'series' && !showSearch ? 'active' : ''}`}
          onClick={() => { setActiveTab('series'); setShowSearch(false) }}
          aria-label="Reihen"
        >
          <Library style={{ width: '1.25rem', height: '1.25rem' }} />
          <span>Reihen</span>
        </button>

        {/* Kontextueller Hinzufügen-Button */}
        <button
          className="bottom-nav-item"
          onClick={handleAddTap}
          aria-label={activeTab === 'series' ? 'Reihe hinzufügen' : 'Buch hinzufügen'}
        >
          {activeTab === 'series'
            ? <LibraryBig style={{ width: '1.25rem', height: '1.25rem' }} />
            : <BookPlus   style={{ width: '1.25rem', height: '1.25rem' }} />
          }
          <span>Hinzufügen</span>
        </button>
      </nav>

      {/* Modals */}
      <AddBookModal isOpen={isAddBookOpen} onClose={() => setIsAddBookOpen(false)} />
      <AddSeriesModal isOpen={isSeriesModalOpen} onClose={() => setIsSeriesModalOpen(false)} />
    </div>
  )
}
