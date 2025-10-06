'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Series, Book } from '@/lib/db'
import { BookCard } from './BookCard'
import { X, Plus, Trash2, Edit2, Save } from 'lucide-react'
import { AddBookToSeriesModal } from './AddBookToSeriesModal'

interface SeriesDetailsModalProps {
  series: Series
  isOpen: boolean
  onClose: () => void
}

export function SeriesDetailsModal({ series, isOpen, onClose }: SeriesDetailsModalProps) {
  const [isAddBookOpen, setIsAddBookOpen] = useState(false)
  const [isEditingSeries, setIsEditingSeries] = useState(false)
  const [editedSeriesName, setEditedSeriesName] = useState(series.name)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const booksInSeries = useLiveQuery(
    () =>
      db.books
        .where('seriesId')
        .equals(series.id!)
        .toArray()
        .then(books => books.sort((a, b) => (a.seriesPosition ?? 0) - (b.seriesPosition ?? 0))),
    [series.id]
  )

  const handleDelete = async () => {
    if (!confirm(`Buchreihe "${series.name}" wirklich löschen? Bücher bleiben erhalten.`)) return
    setIsDeleting(true)
    try {
      const booksToUpdate = await db.books.where('seriesId').equals(series.id!).toArray()
      await Promise.all(
        booksToUpdate.map(book => db.books.update(book.id!, { seriesId: undefined, seriesPosition: undefined }))
      )
      await db.series.delete(series.id!)
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveSeriesName = async () => {
    if (!editedSeriesName.trim()) {
      alert('Name der Buchreihe darf nicht leer sein')
      return
    }
    
    setIsSaving(true)
    try {
      await db.series.update(series.id!, { name: editedSeriesName.trim() })
      series.name = editedSeriesName.trim()
      setIsEditingSeries(false)
    } catch (error) {
      alert('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  // Wenn AddBookModal geöffnet wird, zeige nur das an
  if (isAddBookOpen) {
    return (
      <AddBookToSeriesModal
        isOpen={isAddBookOpen}
        onClose={() => setIsAddBookOpen(false)}
        series={series}
      />
    )
  }

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          {isEditingSeries ? (
            <div className="flex gap-2 items-center flex-1">
              <input
                type="text"
                value={editedSeriesName}
                onChange={(e) => setEditedSeriesName(e.target.value)}
                className="input input-bordered flex-1"
                disabled={isSaving}
              />
              <button
                className="btn btn-success btn-sm"
                onClick={handleSaveSeriesName}
                disabled={isSaving}
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setIsEditingSeries(false)
                  setEditedSeriesName(series.name)
                }}
                disabled={isSaving}
              >
                Abbrechen
              </button>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-xl">{series.name}</h3>
              <div className="flex gap-2">
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setIsEditingSeries(true)}
                  aria-label="Buchreihe bearbeiten"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose} aria-label="Schließen">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>

        <button className="btn btn-primary mb-4" onClick={() => setIsAddBookOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Buch hinzufügen
        </button>

        {(!booksInSeries || booksInSeries.length === 0) && (
          <p className="text-center text-sm text-gray-500 py-8">Noch keine Bücher in dieser Reihe</p>
        )}

        {booksInSeries && booksInSeries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {booksInSeries.map((book: Book) => (
              <BookCard key={book.id} book={book} viewMode="grid" />
            ))}
          </div>
        )}

        <div className="mt-6">
          <button
            className="btn btn-error btn-sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? 'Löscht...' : 'Buchreihe löschen'}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  )
}
