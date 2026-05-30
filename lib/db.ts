import Dexie, { Table } from 'dexie'

export interface Book {
  id?: string
  title: string
  author: string
  coverType: 'upload' | 'url' | 'none'
  coverUrl?: string
  coverBlob?: Blob
  seriesId?: string
  seriesPosition?: number
  status: 'unread' | 'reading' | 'finished'
  rating?: number // float, z.B. 3.5
  tags?: string[]    // max 3, simple string labels
  dateRead?: Date
  dateAdded: Date
}

export interface Series {
  id?: string
  name: string
  totalBooks: number
  dateCreated: Date
  overallRating?: number // Durchschnitt aller Buchbewertungen, gerundet auf 0.5
}

export interface Settings {
  id?: string
  theme: 'light' | 'dark'
  defaultView: 'grid' | 'list'
  sortBy: 'title' | 'author' | 'dateAdded' | 'rating'
  sortOrder: 'asc' | 'desc'
}

class SimpleBibDB extends Dexie {
  books!: Table<Book, string>
  series!: Table<Series, string>
  settings!: Table<Settings, string>

  constructor() {
    super('SimpleBibDB')
    this.version(3).stores({
      books: '++id, title, author, status, rating, seriesId, dateAdded, *tags',
      series: '++id, name, dateCreated, overallRating',
      settings: '++id',
    })
  }
}

export const db = new SimpleBibDB()

export async function initializeSettings() {
  const count = await db.settings.count()
  if (count === 0) {
    await db.settings.add({
      theme: 'light',
      defaultView: 'grid',
      sortBy: 'dateAdded',
      sortOrder: 'desc',
    })
  }
}

export async function updateSeriesRating(seriesId: string) {
  const books = await db.books.where('seriesId').equals(seriesId).toArray()
  const ratings = books
    .map((b) => b.rating)
    .filter((r) => r !== undefined && r !== null) as number[]

  if (ratings.length === 0) {
    await db.series.update(seriesId, { overallRating: undefined })
    return
  }

  const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length
  const roundedRating = Math.round(avgRating * 2) / 2 // auf 0.5 runden

  await db.series.update(seriesId, { overallRating: roundedRating })
}

/** Delete a book and update its series rating if applicable */
export async function deleteBook(bookId: string, seriesId?: string) {
  await db.books.delete(bookId)
  if (seriesId) await updateSeriesRating(seriesId)
}

/** Sort books based on settings */
export type SortKey = Settings['sortBy']
export type SortDir = Settings['sortOrder']

export function sortBooks(books: Book[], key: SortKey, dir: SortDir): Book[] {
  return [...books].sort((a, b) => {
    let cmp = 0
    switch (key) {
      case 'title':
        cmp = a.title.localeCompare(b.title)
        break
      case 'author':
        cmp = (a.author || '').localeCompare(b.author || '')
        break
      case 'dateAdded':
        cmp = new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
        break
      case 'rating':
        cmp = (a.rating ?? 0) - (b.rating ?? 0)
        break
    }
    return dir === 'asc' ? cmp : -cmp
  })
}

/** Search books by query matching title, author, or tags */
export function searchBooks(books: Book[], query: string): Book[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return books.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.author.toLowerCase().includes(q) ||
    (b.tags && b.tags.some(t => t.toLowerCase().includes(q)))
  )
}

/** Export all data as a portable JSON blob */
export async function exportLibrary(): Promise<string> {
  const [books, series, settings] = await Promise.all([
    db.books.toArray(),
    db.series.toArray(),
    db.settings.toArray(),
  ])
  // Strip blob data — can't serialize, and covers will be re-fetched/re-uploaded
  const cleanBooks = books.map(({ coverBlob, ...rest }) => rest)
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), books: cleanBooks, series, settings }, null, 2)
}

/** Import library data — merges, does NOT overwrite */
export async function importLibrary(json: string): Promise<{ books: number; series: number }> {
  const data = JSON.parse(json)
  if (!data || !Array.isArray(data.books)) throw new Error('Ungültiges Export-Format')

  let booksAdded = 0, seriesAdded = 0

  // Import series first (map old ids)
  const seriesIdMap = new Map<string, string>()
  if (Array.isArray(data.series)) {
    for (const s of data.series) {
      const oldId = s.id
      const { id, ...rest } = s
      const newId = await db.series.add(rest as Series)
      seriesIdMap.set(oldId, newId as string)
      seriesAdded++
    }
  }

  // Import books, mapping series references
  for (const b of data.books) {
    const { id, seriesId, coverBlob, ...rest } = b
    const book: any = { ...rest, dateAdded: new Date(b.dateAdded ?? Date.now()) }
    if (seriesId && seriesIdMap.has(seriesId)) {
      book.seriesId = seriesIdMap.get(seriesId)
    } else if (seriesId) {
      // Series not found — detach the book from series
      book.seriesId = undefined
      book.seriesPosition = undefined
    }
    await db.books.add(book as Book)
    booksAdded++
  }

  // Recalculate all series ratings
  for (const newId of seriesIdMap.values()) {
    await updateSeriesRating(newId)
  }

  return { books: booksAdded, series: seriesAdded }
}
