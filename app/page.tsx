// 🎯 PWA-Pattern: Main Bibliothek View
// ✅ TypeScript Strict Mode
// ⚡ Performance-Critical: Lazy Loading
// 📱 App-like UX: Mobile-Optimized

'use client'

import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Book } from '@/lib/db'
import { BookCard } from '@/components/BookCard'
import { AddBookButton } from '@/components/AddBookButton'
import { Header } from '@/components/Header'
import { BookPlus } from 'lucide-react'

export default function HomePage() {
  // Live Query für Reactive Updates
  const books = useLiveQuery(() => db.books.toArray())
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Loading State
  if (!books) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  // Empty State
  if (books.length === 0) {
    return (
      <div className="min-h-screen bg-base-200">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <BookPlus className="w-24 h-24 mx-auto mb-6 text-base-content/30" />
            <h2 className="text-2xl font-bold mb-2">Noch keine Bücher</h2>
            <p className="text-base-content/60 mb-8">
              Füge dein erstes Buch hinzu, um deine Bibliothek zu starten!
            </p>
            <AddBookButton />
          </div>
        </div>
      </div>
    )
  }

  // Books View
  return (
    <div className="min-h-screen bg-base-200">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* View Controls */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Meine Bibliothek ({books.length})
          </h1>
          
          <div className="flex gap-2">
            <button
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
        </div>

        {/* Books Grid/List */}
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
            : 'flex flex-col gap-4'
        }>
          {books.map((book) => (
            <BookCard key={book.id} book={book} viewMode={viewMode} />
          ))}
        </div>
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-6 right-6">
        <AddBookButton />
      </div>
    </div>
  )
}
