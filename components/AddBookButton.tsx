'use client'

import { useState, useEffect } from 'react'
import { AddBookModal } from './AddBookModal'

export function AddBookButton() {
  const [isOpen, setIsOpen] = useState(false)

  // CustomEvent-Listener für Bottom-Nav "Hinzufügen"-Tab auf Mobile
  useEffect(() => {
    const handler = () => setIsOpen(true)
    document.addEventListener('yuno:add-book', handler)
    return () => document.removeEventListener('yuno:add-book', handler)
  }, [])

  return (
    <>
      {/* Desktop FAB — auf Mobile durch Bottom-Nav ersetzt (hidden sm:flex in page.tsx) */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Buch hinzufügen"
        className="
          w-14 h-14 rounded-full
          bg-primary text-primary-content
          shadow-lg
          flex items-center justify-center
          transition-all duration-200
          hover:shadow-xl hover:scale-105
          active:scale-95
          -webkit-tap-highlight-color: transparent
        "
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <line x1="10" y1="3" x2="10" y2="17"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="3" y1="10" x2="17" y2="10"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      <AddBookModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
