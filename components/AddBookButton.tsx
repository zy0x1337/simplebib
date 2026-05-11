'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AddBookModal } from './AddBookModal'

export function AddBookButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Buch hinzufügen"
        className="
          fixed bottom-6 right-6 z-40
          w-14 h-14 rounded-full
          bg-primary text-primary-content
          shadow-lg hover:shadow-xl
          flex items-center justify-center
          transition-all duration-200
          hover:scale-105 active:scale-95
        "
      >
        {/* Handgezeichnetes Plus — zwei feine Linien */}
        <svg
          width="20" height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <line x1="10" y1="3" x2="10" y2="17"
            stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line x1="3" y1="10" x2="17" y2="10"
            stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <AddBookModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
