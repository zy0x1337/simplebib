// 🎯 PWA-Pattern: IndexedDB für Offline-First Storage
// ✅ TypeScript Strict Mode mit Dexie
// ⚡ Performance-Critical: Indexed Queries
// 📱 Offline-First: Alle Daten lokal

import Dexie, { Table } from 'dexie'

// Types
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
  rating?: number
  dateRead?: Date
  dateAdded: Date
}

export interface Series {
  id?: string
  name: string
  totalBooks: number
  dateCreated: Date
}

export interface Settings {
  id?: string
  theme: 'light' | 'dark'
  defaultView: 'grid' | 'list'
  sortBy: 'title' | 'author' | 'dateAdded' | 'rating'
  sortOrder: 'asc' | 'desc'
}

// Database
class SimpleBibDB extends Dexie {
  books!: Table<Book>
  series!: Table<Series>
  settings!: Table<Settings>

  constructor() {
    super('SimpleBibDB')
    
    this.version(1).stores({
      books: '++id, title, author, status, rating, seriesId, dateAdded',
      series: '++id, name, dateCreated',
      settings: '++id',
    })
  }
}

export const db = new SimpleBibDB()

// Helper: Initialize Default Settings
export async function initializeSettings() {
  const existing = await db.settings.count()
  if (existing === 0) {
    await db.settings.add({
      theme: 'light',
      defaultView: 'grid',
      sortBy: 'dateAdded',
      sortOrder: 'desc',
    })
  }
}
