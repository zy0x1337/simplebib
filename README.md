# 📚 SimpleBib

A simple, offline-first book tracker built with Next.js and TypeScript. Track your reading progress, organize books into series, and search via Google Books API - all without a backend.

## Features

- **Book Management**: Add, edit, and track books with status (unread, reading, finished)
- **Star Ratings**: Rate books from 0-5 stars with half-star precision
- **Series Support**: Organize books into series with automatic rating calculation
- **Google Books Integration**: Search by ISBN, title, or author
- **Custom Covers**: Upload images or use URLs
- **Offline-First**: All data stored locally in IndexedDB
- **Dark/Light Mode**: Theme switcher with persistent preferences
- **Responsive**: Works on desktop, tablet, and mobile

## Quick Start

Install dependencies
pnpm install

Run development server
pnpm dev

Build for production
pnpm build

text

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Dexie.js** (IndexedDB)
- **Tailwind CSS** + DaisyUI
- **Google Books API**

## Project Structure

simplebib/
├── app/ # Next.js pages
├── components/ # React components
├── lib/
│ ├── db.ts # Database schema
│ └── imageUtils.ts # Image compression
└── public/ # Static assets

text

## License

MIT