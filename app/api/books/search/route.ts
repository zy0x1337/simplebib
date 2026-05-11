import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.GOOGLE_BOOKS_API_KEY
const BASE    = 'https://www.googleapis.com/books/v1/volumes'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')
  if (!q?.trim()) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 })
  }

  const url = new URL(BASE)
  url.searchParams.set('q', q)
  url.searchParams.set('maxResults', '15')
  if (API_KEY) url.searchParams.set('key', API_KEY)

  try {
    const res  = await fetch(url.toString(), { next: { revalidate: 60 } })
    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error?.message ?? `Google API error ${res.status}` },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Network error' }, { status: 502 })
  }
}
