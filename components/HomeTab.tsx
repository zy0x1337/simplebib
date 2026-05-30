'use client'

import { Book, Series } from '@/lib/db'
import { HomeStats } from '@/components/HomeStats'
import { BookCard } from '@/components/BookCard'
import { SeriesCard } from '@/components/SeriesCard'

interface HomeTabProps {
  recentBooks: Book[]
  recentSeries: Series[]
  onTabChange: (tab: 'books' | 'series') => void
}

export function HomeTab({ recentBooks, recentSeries, onTabChange }: HomeTabProps) {
  return (
    <div
      className="anim-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 8px))',
      }}
    >
      {/* Stats */}
      <HomeStats />

      {/* Recently added books */}
      {recentBooks.length > 0 && (
        <section>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 'var(--space-3)',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-base)',
              fontStyle: 'italic',
              fontWeight: 400,
              color: 'var(--color-text)',
            }}>
              Zuletzt hinzugefügt
            </h3>
            <button
              onClick={() => onTabChange('books')}
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-accent)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: 'var(--tracking-wide)',
              }}
            >
              Alle ansehen →
            </button>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-3)',
          }} className="sm:grid-cols-6">
            {recentBooks.map((book, i) => (
              <div key={book.id} className="anim-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                <BookCard book={book} viewMode="grid" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Series */}
      {recentSeries.length > 0 && (
        <section>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 'var(--space-3)',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-base)',
              fontStyle: 'italic',
              fontWeight: 400,
              color: 'var(--color-text)',
            }}>
              Buchreihen
            </h3>
            <button
              onClick={() => onTabChange('series')}
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-accent)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: 'var(--tracking-wide)',
              }}
            >
              Alle ansehen →
            </button>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'var(--space-3)',
          }} className="sm:grid-cols-2">
            {recentSeries.map((series, i) => (
              <div key={series.id} className="anim-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                <SeriesCard series={series} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
