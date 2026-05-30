'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { SeriesCard } from '@/components/SeriesCard'
import { Library } from 'lucide-react'

interface SeriesTabProps {
  onAddSeries: () => void
}

export function SeriesTab({ onAddSeries }: SeriesTabProps) {
  const allSeries = useLiveQuery(() => db.series.toArray(), [])

  const sortedSeries = allSeries
    ? [...allSeries].sort((a, b) => {
        if (b.overallRating === undefined) return -1
        if (a.overallRating === undefined) return 1
        return b.overallRating - a.overallRating
      })
    : []

  if (!allSeries) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12) 0' }}>
        <div style={{
          width: '2rem', height: '2rem', borderRadius: '50%',
          border: '2px solid var(--color-border)',
          borderTopColor: 'var(--color-accent)',
          animation: 'spin 0.75s linear infinite',
        }} />
      </div>
    )
  }

  return (
    <>
      {sortedSeries.length > 0 ? (
        <div
          className="anim-fade-in"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'var(--space-3)',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 8px))',
          }} className="sm:grid-cols-2 lg:grid-cols-3"
        >
          {sortedSeries.map((series, index) => (
            <div key={series.id} className="anim-fade-up" style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s` }}>
              <SeriesCard series={series} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 'var(--space-3)', padding: 'var(--space-12) 0', textAlign: 'center',
        }}>
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
            onClick={onAddSeries}
          >
            <Library style={{ width: '1rem', height: '1rem' }} />
            Erste Reihe erstellen
          </button>
        </div>
      )}
    </>
  )
}
