'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

interface ManualISBNInputProps {
  onISBNSubmit: (isbn: string) => void
}

export function ManualISBNInput({ onISBNSubmit }: ManualISBNInputProps) {
  const [isbn, setIsbn] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isbn.trim()) {
      alert('Bitte ISBN-Code eingeben')
      return
    }

    setIsLoading(true)
    try {
      await onISBNSubmit(isbn.trim())
      setIsbn('') // Eingabe zurücksetzen nach erfolgreicher Suche
    } catch (error) {
      alert('Fehler beim Laden der Buchdaten')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        placeholder="ISBN-Code eingeben..."
        value={isbn}
        onChange={(e) => setIsbn(e.target.value)}
        className="input input-bordered flex-1"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="btn btn-primary"
        disabled={isLoading || !isbn.trim()}
      >
        {isLoading ? (
          <>
            <span className="loading loading-spinner loading-sm mr-2"></span>
            Suche...
          </>
        ) : (
          <>
            <Search className="w-5 h-5 mr-2" />
            Buch suchen
          </>
        )}
      </button>
    </form>
  )
}
