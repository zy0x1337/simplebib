'use client'

import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { BentoSeriesGrid } from '@/components/BentoSeriesGrid'
import { Search, X, Library } from 'lucide-react'

interface SeriesTabProps {
  onAddSeries: () => void
}

export function SeriesTab({ onAddSeries }: SeriesTabProps) {
  const allSeries = useLiveQuery(() => db.series.toArray(), [])
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSeries = useMemo(() => {
    if (!allSeries) return []
    const q = searchQuery.toLowerCase().trim()
    const filtered = q
      ? allSeries.filter(s => s.name.toLowerCase().includes(q))
      : allSeries
    return [...filtered].sort((a, b) => {
      if (b.overallRating === undefined) return -1
      if (a.overallRating === undefined) return 1
      return b.overallRating - a.overallRating
    })
  }, [allSeries, searchQuery])

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

  // Empty state — no series at all
  if (allSeries.length === 0) {
    return (
      <div className="anim-fade-in" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 'var(--space-3)', padding: 'var(--space-12) 0', textAlign: 'center',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 8px))',
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
    )
  }

  return (
    <div className="anim-fade-in" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 8px))' }}>
      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 'var(--space-3)' }}>
        <Search style={{
          position: 'absolute', left: '0.625rem', top: '50%',
          transform: 'translateY(-50%)', width: '0.875rem', height: '0.875rem',
          color: 'var(--color-text-faint)', pointerEvents: 'none',
        }} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Reihen durchsuchen…"
          className="bib-input"
          style={{ paddingLeft: '1.75rem', paddingRight: searchQuery ? '2rem' : undefined, fontSize: 'var(--text-sm)' }}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute', right: '0.625rem', top: '50%',
              transform: 'translateY(-50%)',
              background: 'none', border: 'none', padding: 0,
              color: 'var(--color-text-faint)', cursor: 'pointer',
            }}>
            <X style={{ width: '0.75rem', height: '0.75rem' }} />
          </button>
        )}
      </div>

      {/* Results info */}
      {searchQuery && (
        <p style={{
          fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)',
          marginBottom: 'var(--space-3)',
        }}>
          {filteredSeries.length} {filteredSeries.length === 1 ? 'Treffer' : 'Treffer'} für »{searchQuery}«
        </p>
      )}

      {/* Series grid — Bento */}
      <BentoSeriesGrid series={filteredSeries} />
    </div>
  )
}
