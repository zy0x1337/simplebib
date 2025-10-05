'use client'

import { useState } from 'react'
import { Search, BookOpen } from 'lucide-react'

interface BookSearchProps {
  onBookSelect: (book: { title: string; authors: string; coverUrl: string }) => void
}

export function BookSearch({ onBookSelect }: BookSearchProps) {
  const [searchType, setSearchType] = useState<'isbn' | 'title'>('isbn')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      alert('Bitte Suchbegriff eingeben')
      return
    }

    setIsLoading(true)
    setSearchResults([])
    setShowResults(false)

    try {
      if (searchType === 'isbn') {
        // ISBN-Suche
        const cleanISBN = searchQuery.replace(/-/g, '')
        const res = await fetch(
          `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanISBN}&format=json&jscmd=data`
        )
        const data = await res.json()
        const bookData = data[`ISBN:${cleanISBN}`]
        
        if (!bookData) {
          alert('Kein Buch mit dieser ISBN gefunden')
          return
        }

        const book = {
          title: bookData.title,
          authors: (bookData.authors || []).map((a: any) => a.name).join(', '),
          coverUrl: bookData.cover?.medium || '',
        }

        onBookSelect(book)
        setSearchQuery('')
      } else {
        // Titel-Suche
        const res = await fetch(
          `https://openlibrary.org/search.json?title=${encodeURIComponent(searchQuery)}&limit=10`
        )
        const data = await res.json()

        if (!data.docs || data.docs.length === 0) {
          alert('Kein Buch mit diesem Titel gefunden')
          return
        }

        const results = data.docs.map((doc: any) => ({
          title: doc.title,
          authors: doc.author_name ? doc.author_name.join(', ') : 'Unbekannter Autor',
          coverUrl: doc.cover_i
            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
            : '',
          year: doc.first_publish_year || null,
        }))

        setSearchResults(results)
        setShowResults(true)
      }
    } catch (error) {
      alert('Fehler bei der Suche')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectResult = (book: any) => {
    onBookSelect(book)
    setSearchQuery('')
    setSearchResults([])
    setShowResults(false)
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="flex flex-col gap-3">
        {/* Auswahl: ISBN oder Titel */}
        <div className="tabs tabs-boxed">
          <a
            className={`tab ${searchType === 'isbn' ? 'tab-active' : ''}`}
            onClick={() => {
              setSearchType('isbn')
              setSearchQuery('')
              setSearchResults([])
              setShowResults(false)
            }}
          >
            ISBN
          </a>
          <a
            className={`tab ${searchType === 'title' ? 'tab-active' : ''}`}
            onClick={() => {
              setSearchType('title')
              setSearchQuery('')
              setSearchResults([])
              setShowResults(false)
            }}
          >
            Buchtitel
          </a>
        </div>

        {/* Suchfeld */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={
              searchType === 'isbn'
                ? 'ISBN-Code eingeben...'
                : 'Buchtitel eingeben...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered flex-1"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !searchQuery.trim()}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                Suche...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Suchen
              </>
            )}
          </button>
        </div>
      </form>

      {/* Suchergebnisse bei Titel-Suche */}
      {showResults && searchResults.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="font-semibold text-sm">Suchergebnisse:</h3>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="card bg-base-100 shadow-sm hover:shadow-md cursor-pointer transition-shadow p-3"
                onClick={() => handleSelectResult(result)}
              >
                <div className="flex gap-3">
                  {result.coverUrl ? (
                    <img
                      src={result.coverUrl}
                      alt={result.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-24 bg-base-300 rounded flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-base-content/30" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{result.title}</h4>
                    <p className="text-xs text-base-content/60">{result.authors}</p>
                    {result.year && (
                      <p className="text-xs text-base-content/40 mt-1">
                        Erstveröffentlichung: {result.year}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
