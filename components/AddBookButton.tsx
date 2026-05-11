'use client'

import { useState, useEffect } from 'react'
import { AddBookModal } from './AddBookModal'
import { Plus } from 'lucide-react'

export function AddBookButton() {
  const [isOpen, setIsOpen] = useState(false)

  // CustomEvent-Listener für Bottom-Nav „Hinzufügen“-Tab auf Mobile
  useEffect(() => {
    const handler = () => setIsOpen(true)
    document.addEventListener('yuno:add-book', handler)
    return () => document.removeEventListener('yuno:add-book', handler)
  }, [])

  return (
    <>
      {/* Desktop FAB — auf Mobile durch Bottom-Nav ersetzt */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Buch hinzufügen"
        className="btn-bib-primary"
        style={{
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: 'var(--radius-full)',
          padding: 0,
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <Plus style={{ width: '1.25rem', height: '1.25rem' }} strokeWidth={2} />
      </button>

      <AddBookModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
