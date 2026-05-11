/*
  Alle Google Books Calls laufen über die interne Route /api/books/search.
  Der API-Key wird server-seitig angehängt — nie im Browser-Bundle.
*/

async function googleBooks(q: string) {
  const res  = await fetch(`/api/books/search?q=${encodeURIComponent(q)}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? `API error ${res.status}`)
  return data
}

export async function fetchBookByISBN(isbn: string) {
  const clean = isbn.replace(/-/g, '')
  const data  = await googleBooks(`isbn:${clean}`)

  if (!data.items?.length) throw new Error('Buch nicht gefunden')

  const v = data.items[0].volumeInfo
  return {
    title:         v.title ?? '',
    authors:       v.authors?.join(', ') ?? 'Unbekannter Autor',
    coverUrl:      v.imageLinks?.thumbnail?.replace('http:', 'https:') ?? '',
    description:   v.description ?? '',
    publishedDate: v.publishedDate ?? '',
  }
}

export async function fetchBookByTitle(title: string) {
  const data = await googleBooks(`intitle:${title}`)

  if (!data.items?.length) throw new Error('Kein Buch gefunden')

  return data.items.map((item: any) => {
    const v = item.volumeInfo
    return {
      title:         v.title ?? '',
      authors:       v.authors?.join(', ') ?? 'Unbekannter Autor',
      coverUrl:      v.imageLinks?.thumbnail?.replace('http:', 'https:') ?? '',
      publishedDate: v.publishedDate ?? '',
    }
  })
}
