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
        const cleanISBN = searchQuery.replace(/-/g, '')
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanISBN}`
        )
        const data = await res.json()
        if (!data.items || data.items.length === 0) {
          alert('Kein Buch mit dieser ISBN gefunden')
          return
        }

        const bookData = data.items[0].volumeInfo
        const book = {
          title: bookData.title,
          authors: bookData.authors ? bookData.authors.join(', ') : 'Unbekannter Autor',
          coverUrl: bookData.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
        }

        onBookSelect(book)
        setSearchQuery('')
      } else {
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(searchQuery)}&maxResults=10`
        )
        const data = await res.json()

        if (!data.items || data.items.length === 0) {
          alert('Kein Buch mit diesem Titel gefunden')
          return
        }

        const results = data.items.map((item: any) => {
          const info = item.volumeInfo
          return {
            title: info.title || '',
            authors: info.authors ? info.authors.join(', ') : 'Unbekannter Autor',
            coverUrl: info.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
            publishedDate: info.publishedDate || '',
          }
        })

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
        <div className="tabs tabs-boxed">
          <a
            className={`tab ${searchType === 'isbn' ? 'tab-active' : ''}`}
            onClick={() => {
              setSearchType('isbn')
              setSearchQuery('')
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
              setShowResults(false)
            }}
          >
            Buchtitel
          </a>
        </div>

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
                    {result.publishedDate && (
                      <p className="text-xs text-base-content/40 mt-1">
                        Erstveröffentlichung: {result.publishedDate}
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
