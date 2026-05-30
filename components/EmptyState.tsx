'use client'

import { BookSearch } from '@/components/BookSearch'
import { Plus, Library } from 'lucide-react'

interface EmptyStateProps {
  onBookSelect: (book: { title: string; authors: string; coverUrl: string }) => void
  onAddBook: () => void
  onAddSeries: () => void
}

export function EmptyState({ onBookSelect, onAddBook, onAddSeries }: EmptyStateProps) {
  return (
    <div style={{
      minHeight: '100svh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 'var(--space-12) var(--space-5)',
    }} className="anim-fade-in">
      <div style={{
        maxWidth: '20rem',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center',
        gap: 'var(--space-6)',
      }}>
        {/* Book illustration */}
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
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)',
            fontStyle: 'italic', fontWeight: 300,
            marginBottom: 'var(--space-2)',
            lineHeight: 'var(--leading-tight)', color: 'var(--color-text)',
          }}>
            Deine Bibliothek
          </h2>
          <p style={{
            fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)',
            lineHeight: 'var(--leading-relaxed)',
          }}>
            Noch leer — aber das ändert sich gleich.
          </p>
        </div>

        <div style={{ width: '100%' }} className="anim-fade-up delay-2">
          <BookSearch onBookSelect={onBookSelect} />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }} className="anim-fade-up delay-3">
          <button className="btn-bib-primary" onClick={onAddBook}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Plus style={{ width: '1rem', height: '1rem' }} />
            Buch hinzufügen
          </button>
          <button className="btn-bib-ghost" onClick={onAddSeries}
            style={{
              border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            }}>
            <Library style={{ width: '1rem', height: '1rem' }} />
            Reihe anlegen
          </button>
        </div>
      </div>
    </div>
  )
}
