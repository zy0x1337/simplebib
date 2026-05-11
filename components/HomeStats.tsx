'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { BookOpen, BookMarked, BookCheck, Library, Star } from 'lucide-react'

export function HomeStats() {
  const books  = useLiveQuery(() => db.books.toArray(), [])
  const series = useLiveQuery(() => db.series.toArray(), [])

  if (!books || !series) return null

  const total    = books.length
  const finished = books.filter(b => b.status === 'finished').length
  const reading  = books.filter(b => b.status === 'reading').length
  const unread   = books.filter(b => b.status === 'unread').length
  const ratings  = books.map(b => b.rating).filter((r): r is number => r != null && r > 0)
  const avgRating = ratings.length > 0
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : null

  const pctFinished = total > 0 ? (finished / total) * 100 : 0
  const pctReading  = total > 0 ? (reading  / total) * 100 : 0
  const pctUnread   = total > 0 ? (unread   / total) * 100 : 0

  const stats = [
    {
      icon: <BookCheck  style={{ width: '1.1rem', height: '1.1rem' }} />,
      label: 'Gelesen',
      value: finished,
      color: 'var(--color-accent)',
      muted: 'var(--color-accent-muted)',
    },
    {
      icon: <BookOpen   style={{ width: '1.1rem', height: '1.1rem' }} />,
      label: 'Lese ich',
      value: reading,
      color: 'var(--color-reading)',
      muted: 'var(--color-reading-muted)',
    },
    {
      icon: <BookMarked style={{ width: '1.1rem', height: '1.1rem' }} />,
      label: 'Ungelesen',
      value: unread,
      color: 'var(--color-text-muted)',
      muted: 'var(--color-surface-offset)',
    },
    {
      icon: <Library    style={{ width: '1.1rem', height: '1.1rem' }} />,
      label: 'Reihen',
      value: series.length,
      color: 'var(--color-text)',
      muted: 'var(--color-surface-offset)',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

      {/* Stat chips */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 'var(--space-2)',
      }} className="sm:grid-cols-4">
        {stats.map(s => (
          <div
            key={s.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <span style={{ color: s.color, flexShrink: 0 }}>{s.icon}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 'var(--text-xl)',
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                lineHeight: 1.1,
                color: 'var(--color-text)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {s.value}
              </div>
              <div style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                letterSpacing: 'var(--tracking-wide)',
                marginTop: '0.1rem',
              }}>
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar + avg rating row */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        padding: 'var(--space-3) var(--space-4)',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        {/* Label row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', letterSpacing: 'var(--tracking-wide)' }}>
            {total === 0 ? 'Noch keine Bücher' : `${total} ${total === 1 ? 'Buch' : 'Bücher'} gesamt`}
          </span>
          {avgRating && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              fontSize: 'var(--text-xs)', color: 'var(--color-star)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              <Star style={{ width: '0.75rem', height: '0.75rem', fill: 'var(--color-star)' }} />
              ⌀ {avgRating}
            </span>
          )}
        </div>

        {/* Segmented progress bar */}
        {total > 0 && (
          <div style={{
            display: 'flex',
            height: '0.375rem',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            background: 'var(--color-surface-offset)',
            gap: '1px',
          }}>
            {pctFinished > 0 && (
              <div style={{
                width: `${pctFinished}%`,
                background: 'var(--color-accent)',
                transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)',
              }} />
            )}
            {pctReading > 0 && (
              <div style={{
                width: `${pctReading}%`,
                background: 'var(--color-reading)',
                transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)',
              }} />
            )}
            {pctUnread > 0 && (
              <div style={{
                width: `${pctUnread}%`,
                background: 'var(--color-surface-dynamic)',
                transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)',
              }} />
            )}
          </div>
        )}

        {/* Legend */}
        {total > 0 && (
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            {[
              { label: 'Gelesen',   pct: pctFinished, color: 'var(--color-accent)'  },
              { label: 'Lese ich',  pct: pctReading,  color: 'var(--color-reading)' },
              { label: 'Ungelesen', pct: pctUnread,   color: 'var(--color-surface-dynamic)' },
            ].filter(l => l.pct > 0).map(l => (
              <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
                <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: l.color, display: 'inline-block', flexShrink: 0 }} />
                {Math.round(l.pct)} % {l.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
