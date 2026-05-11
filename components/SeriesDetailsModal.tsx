'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Series, Book } from '@/lib/db'
import { X, Plus, Trash2, BookOpen, Star, StarHalf, Edit2, Save } from 'lucide-react'
import { AddBookToSeriesModal } from './AddBookToSeriesModal'
import { BookDetailsModal } from './BookDetailsModal'

interface SeriesDetailsModalProps {
  series: Series
  isOpen: boolean
  onClose: () => void
}

function MiniStars({ rating }: { rating?: number }) {
  if (!rating) return null
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const n = i + 1
        return rating >= n
          ? <Star key={n} className="w-3 h-3 fill-warning text-warning" />
          : rating >= n - 0.5
          ? <StarHalf key={n} className="w-3 h-3 fill-warning text-warning" />
          : <Star key={n} className="w-3 h-3 text-base-content/15" />
      })}
    </div>
  )
}

export function SeriesDetailsModal({ series, isOpen, onClose }: SeriesDetailsModalProps) {
  const [isAddBookOpen, setIsAddBookOpen]   = useState(false)
  const [selectedBook, setSelectedBook]     = useState<Book | null>(null)
  const [isEditingName, setIsEditingName]   = useState(false)
  const [editedName, setEditedName]         = useState(series.name)
  const [isDeleting, setIsDeleting]         = useState(false)
  const [isSavingName, setIsSavingName]     = useState(false)

  const booksInSeries = useLiveQuery(
    () => db.books.where('seriesId').equals(series.id!).toArray()
          .then(books => books.sort((a, b) => (a.seriesPosition || 0) - (b.seriesPosition || 0))),
    [series.id]
  )

  const handleSaveName = async () => {
    if (!editedName.trim()) return
    setIsSavingName(true)
    try {
      await db.series.update(series.id!, { name: editedName.trim() })
      setIsEditingName(false)
    } finally { setIsSavingName(false) }
  }

  const handleDelete = async () => {
    if (!confirm(`Buchreihe „${series.name}“ wirklich löschen?\nBücher bleiben erhalten.`)) return
    setIsDeleting(true)
    try {
      const books = await db.books.where('seriesId').equals(series.id!).toArray()
      await Promise.all(books.map(b =>
        db.books.update(b.id!, { seriesId: undefined, seriesPosition: undefined })
      ))
      await db.series.delete(series.id!)
      onClose()
    } finally { setIsDeleting(false) }
  }

  const STATUS_CLS: Record<string, string> = {
    unread: 'status-unread', reading: 'status-reading', finished: 'status-finished',
  }
  const STATUS_LABEL: Record<string, string> = {
    unread: 'Ungelesen', reading: 'Lese ich', finished: 'Gelesen',
  }

  if (!isOpen) return null

  const totalBooks    = booksInSeries?.length ?? 0
  const finishedBooks = booksInSeries?.filter(b => b.status === 'finished').length ?? 0
  const readingBooks  = booksInSeries?.filter(b => b.status === 'reading').length  ?? 0

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="absolute inset-0 bg-base-content/30 backdrop-blur-sm anim-fade-in" onClick={onClose} />

        <div className="modal-panel relative w-full sm:max-w-lg max-h-[94dvh]
                        overflow-y-auto rounded-t-2xl sm:rounded-lg anim-modal">

          {/* Handle */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-base-content/20" />
          </div>

          {/* Header */}
          <div className="flex items-start gap-3 px-5 pt-4 pb-3">
            {/* Buchanzahl-Block */}
            <div className="flex-shrink-0 w-12 text-center pt-0.5">
              <span className="font-display text-3xl font-bold leading-none text-primary">
                {totalBooks}
              </span>
              <p className="label-caps mt-0.5">{totalBooks === 1 ? 'Buch' : 'Bücher'}</p>
            </div>

            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    className="bib-input text-base font-semibold flex-1"
                    value={editedName}
                    onChange={e => setEditedName(e.target.value)}
                    autoFocus
                    disabled={isSavingName}
                  />
                  <button onClick={handleSaveName} disabled={isSavingName}
                    className="w-8 h-8 flex items-center justify-center rounded-md
                               text-primary hover:bg-primary/8 transition-colors">
                    <Save className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setIsEditingName(false); setEditedName(series.name) }}
                    className="w-8 h-8 flex items-center justify-center rounded-md
                               text-base-content/40 hover:bg-base-content/6 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <h2 className="font-display text-lg font-semibold leading-snug truncate">
                    {series.name}
                  </h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md
                               text-base-content/30 hover:text-primary hover:bg-primary/8
                               transition-colors"
                    aria-label="Name bearbeiten"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Fortschritts-Segmente */}
              {totalBooks > 0 && (
                <div className="mt-2 flex gap-0.5 h-1">
                  {Array.from({ length: totalBooks }, (_, i) => {
                    const idx = i + 1
                    let bg = 'bg-base-300'
                    if (idx <= finishedBooks) bg = 'bg-primary'
                    else if (idx <= finishedBooks + readingBooks) bg = 'bg-secondary/60'
                    return <div key={i} className={`flex-1 rounded-full ${bg}`} />
                  })}
                </div>
              )}
            </div>

            <button onClick={onClose}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md
                         text-base-content/40 hover:text-base-content hover:bg-base-content/6
                         transition-colors mt-0.5"
              aria-label="Schließen">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bib-divider mx-5" />

          {/* Bücher-Liste */}
          <div className="px-2 py-2">
            {!booksInSeries || booksInSeries.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-base-content/40">
                <BookOpen className="w-8 h-8" />
                <p className="text-sm">Noch keine Bücher in dieser Reihe</p>
              </div>
            ) : (
              booksInSeries.map((book, idx) => (
                <button
                  key={book.id}
                  onClick={() => setSelectedBook(book)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                             hover:bg-base-content/4 transition-colors text-left group
                             anim-fade-up"
                  style={{ animationDelay: `${idx * 0.04}s` }}
                >
                  {/* Bandnummer */}
                  <div className="flex-shrink-0 w-6 text-center">
                    <span className="font-display text-base font-bold text-primary/50
                                     group-hover:text-primary transition-colors">
                      {book.seriesPosition ?? '–'}
                    </span>
                  </div>

                  {/* Mini-Cover */}
                  <div className="flex-shrink-0 w-8 h-12 rounded overflow-hidden bg-base-300">
                    {book.coverBlob || book.coverUrl ? (
                      <img
                        src={book.coverBlob
                          ? URL.createObjectURL(book.coverBlob)
                          : book.coverUrl!}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-3 h-3 text-base-content/25" />
                      </div>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="card-title-serif text-sm truncate
                                  group-hover:text-primary transition-colors">
                      {book.title}
                    </p>
                    <MiniStars rating={book.rating} />
                  </div>

                  {/* Status-Chip */}
                  <span className={STATUS_CLS[book.status]}>
                    {STATUS_LABEL[book.status]}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="bib-divider mx-5" />
          <div className="px-5 py-4 flex items-center justify-between">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm
                         text-error/70 hover:text-error hover:bg-error/8 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'Lösche…' : 'Reihe löschen'}
            </button>

            <button
              onClick={() => setIsAddBookOpen(true)}
              className="btn-bib-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Buch hinzufügen
            </button>
          </div>
        </div>
      </div>

      {isAddBookOpen && (
        <AddBookToSeriesModal
          series={series}
          isOpen={isAddBookOpen}
          onClose={() => setIsAddBookOpen(false)}
        />
      )}

      {selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          isOpen={!!selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </>
  )
}
