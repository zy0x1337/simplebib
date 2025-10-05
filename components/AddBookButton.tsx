// 🎯 PWA-Pattern: Add Book Trigger
// ✅ Simpel & Funktional

'use client'

import { Plus } from 'lucide-react'

export function AddBookButton() {
  const openModal = () => {
    // Modal wird in nächster Iteration implementiert
    alert('Add Book Modal kommt im nächsten Schritt!')
  }

  return (
    <button
      className="btn btn-primary btn-circle btn-lg shadow-lg"
      onClick={openModal}
      aria-label="Buch hinzufügen"
    >
      <Plus className="w-6 h-6" />
    </button>
  )
}
