'use client'

import { useState } from 'react'
import { Search, BookOpen } from 'lucide-react'

interface BookSearchProps {
  onBookSelect: (book: { title: string; authors: string; coverUrl: string }) => void
}

export function BookSearch({ onBookSelect }: BookSearchProps) {
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
      // Prüfen ob es eine ISBN ist (nur Zahlen und optional Bindestriche)
      const cleanQuery = searchQuery.replace(/-/g, '').trim()
      const isISBN = /^\d{10,13}$/.test(cleanQuery)

      let url = ''
      
      if (isISBN) {
        // ISBN-Suche
        url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanQuery}`
      } else {
        // Kombinierte Suche: Titel ODER Autor
        url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=15`
      }

      const res = await fetch(url)
      const data = await res.json()

      if (!data.items || data.items.length === 0) {
        alert('Keine Bücher gefunden. Versuche es mit einem anderen Suchbegriff.')
        return
      }

      if (isISBN && data.items.length === 1) {
        // Bei ISBN-Suche direkt das Buch übernehmen
        const bookData = data.items[0].volumeInfo
        const book = {
          title: bookData.title,
          authors: bookData.authors ? bookData.authors.join(', ') : 'Unbekannter Autor',
          coverUrl: bookData.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
        }
        onBookSelect(book)
        setSearchQuery('')
      } else {
        // Bei Titel/Autor-Suche: Ergebnisse anzeigen
        const results = data.items.map((item: any) => {
          const info = item.volumeInfo
          return {
            title: info.title || '',
            authors: info.authors ? info.authors.join(', ') : 'Unbekannter Autor',
            coverUrl: info.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
            publishedDate: info.publishedDate || '',
            description: info.description || '',
          }
        })
        setSearchResults(results)
        setShowResults(true)
      }
    } catch (error) {
      alert('Fehler bei der Suche. Bitte versuche es erneut.')
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
    <div className="mb-8">
      <form onSubmit={handleSearch} className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">
            <Search className="w-5 h-5" />
            Buch suchen
          </h2>
          <p className="text-sm text-base-content/60 mb-2">
            Suche nach ISBN, Buchtitel oder Autor
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="z.B. 9783453436923, Der Hobbit oder J.R.R. Tolkien"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered flex-1"
              disabled={isLoading}
            />
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Suche...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Suchen
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {showResults && searchResults.length > 0 && (
        <div className="mt-4 card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="font-bold text-lg mb-4">Suchergebnisse ({searchResults.length})</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-3 rounded-lg hover:bg-base-200 cursor-pointer transition-colors"
                  onClick={() => handleSelectResult(result)}
                >
                  <div className="flex-shrink-0">
                    {result.coverUrl ? (
                      <img
                        src={result.coverUrl}
                        alt={result.title}
                        className="w-16 h-24 object-cover rounded shadow"
                      />
                    ) : (
                      <div className="w-16 h-24 bg-base-300 rounded flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-base-content/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1 truncate">{result.title}</h4>
                    <p className="text-sm text-base-content/70 mb-1">{result.authors}</p>
                    {result.publishedDate && (
                      <p className="text-xs text-base-content/50">
                        Erschienen: {result.publishedDate}
                      </p>
                    )}
                    {result.description && (
                      <p className="text-xs text-base-content/60 mt-2 line-clamp-2">
                        {result.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
