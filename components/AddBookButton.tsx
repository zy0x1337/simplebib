// PWA-Pattern: Add Book Trigger mit Modal

'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AddBookModal } from './AddBookModal'

export function AddBookButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        className="btn btn-primary btn-circle btn-lg shadow-lg"
        onClick={() => setIsModalOpen(true)}
        aria-label="Buch hinzufügen"
      >
        <Plus className="w-6 h-6" />
      </button>

      <AddBookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
