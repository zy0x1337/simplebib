'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  confirmStyle?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen, title, message, confirmLabel = 'Bestätigen',
  confirmStyle = 'danger', onConfirm, onCancel,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div
      className="modal-overlay anim-fade-in"
      onClick={onCancel}
      style={{ zIndex: 60 }}
    >
      <div
        className="anim-modal-in"
        onClick={e => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '400px',
          margin: 'auto var(--space-4)',
          padding: 'var(--space-6)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div style={{
          width: '3rem', height: '3rem',
          borderRadius: 'var(--radius-full)',
          background: 'oklch(from var(--color-error) l c h / 0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AlertTriangle style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-error)' }} />
        </div>
        <div>
          <h3 id="confirm-title" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lg)',
            fontStyle: 'italic',
            fontWeight: 400,
            color: 'var(--color-text)',
            marginBottom: 'var(--space-1)',
          }}>
            {title}
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
            {message}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', width: '100%' }}>
          <button onClick={onCancel} className="btn btn-ghost" style={{ flex: 1 }}>
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            className="btn"
            style={{
              flex: 1,
              background: confirmStyle === 'danger' ? 'var(--color-error)' : 'var(--color-accent)',
              color: 'var(--color-text-inverse)',
              fontWeight: 600,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
