'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Book, Series } from '@/lib/db'
import { BookSearch } from '@/components/BookSearch'
import { AddBookModal } from '@/components/AddBookModal'
import { Header } from '@/components/Header'
import { AddSeriesModal } from '@/components/AddSeriesModal'
import { AddBookButton } from '@/components/AddBookButton'
import { EmptyState } from '@/components/EmptyState'
import { HomeTab } from '@/components/HomeTab'
import { BooksTab } from '@/components/BooksTab'
import { SeriesTab } from '@/components/SeriesTab'
import { BookPlus, Library, Search, BookOpen, LibraryBig, LayoutDashboard } from 'lucide-react'

type ActiveTab = 'home' | 'books' | 'series'

export default function HomePage() {
  const [activeTab, setActiveTab]                   = useState<ActiveTab>('home')
  const [isSeriesModalOpen, setIsSeriesModalOpen]   = useState(false)
  const [isAddBookOpen, setIsAddBookOpen]           = useState(false)
  const [preFillBookData, setPreFillBookData]       = useState<{ title: string; authors: string; coverUrl: string } | null>(null)
  const [showSearch, setShowSearch]                 = useState(false)

  const allBooks  = useLiveQuery(() => db.books.toArray())
  const allSeries = useLiveQuery(() => db.series.toArray())

  // Derived data for HomeTab
  const recentBooks = allBooks
    ? [...allBooks]
        .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
        .slice(0, 6)
    : []

  const recentSeries = allSeries
    ? [...allSeries]
        .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
        .slice(0, 4)
    : []

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

  /* ── Loading ───────────────────────────────────────────────── */
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

  /* ── Empty State ───────────────────────────────────────────── */
  if (allBooks.length === 0 && allSeries.length === 0) {
    return (
      <div style={{ minHeight: '100svh', background: 'var(--color-bg)', position: 'relative' }}>
        <Header />
        <EmptyState
          onBookSelect={handleBookSelect}
          onAddBook={() => setIsAddBookOpen(true)}
          onAddSeries={() => setIsSeriesModalOpen(true)}
        />

        <AddSeriesModal isOpen={isSeriesModalOpen} onClose={() => setIsSeriesModalOpen(false)} />
        <AddBookModal isOpen={isAddBookOpen} onClose={() => setIsAddBookOpen(false)} />
        {preFillBookData && (
          <AddBookModal isOpen={true} preFill={preFillBookData} onClose={() => setPreFillBookData(null)} />
        )}
      </div>
    )
  }

  /* ── Main View ─────────────────────────────────────────────── */
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
            className={`bib-tab ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            Übersicht
          </button>
          <button
            className={`bib-tab ${activeTab === 'books' ? 'active' : ''}`}
            onClick={() => setActiveTab('books')}
          >
            Bücher
            <span className="bib-tab-count">{allBooks.filter(b => !b.seriesId).length}</span>
          </button>
          <button
            className={`bib-tab ${activeTab === 'series' ? 'active' : ''}`}
            onClick={() => setActiveTab('series')}
          >
            Reihen
            <span className="bib-tab-count">{allSeries.length}</span>
          </button>
        </div>

        {/* ── TABS CONTENT ─────────────────────────────────── */}
        {activeTab === 'home' && (
          <HomeTab
            recentBooks={recentBooks}
            recentSeries={recentSeries}
            onTabChange={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'books' && (
          <BooksTab onAddBook={() => setIsAddBookOpen(true)} />
        )}

        {activeTab === 'series' && (
          <SeriesTab onAddSeries={() => setIsSeriesModalOpen(true)} />
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
          className={`bottom-nav-item ${activeTab === 'home' && !showSearch ? 'active' : ''}`}
          onClick={() => { setActiveTab('home'); setShowSearch(false) }}
          aria-label="Übersicht"
        >
          <LayoutDashboard style={{ width: '1.25rem', height: '1.25rem' }} />
          <span>Übersicht</span>
        </button>

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
