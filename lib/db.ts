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
    this.version(2).stores({
      books: '++id, title, author, status, rating, seriesId, dateAdded',
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
