export async function fetchBookByISBN(isbn: string) {
  const cleanISBN = isbn.replace(/-/g, '')
  const res = await fetch(
    `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanISBN}&format=json&jscmd=data`
  )
  const data = await res.json()
  const bookData = data[`ISBN:${cleanISBN}`]
  if (!bookData) throw new Error('Buch nicht gefunden')
  return {
    title: bookData.title,
    authors: (bookData.authors || []).map((a: any) => a.name).join(', '),
    coverUrl: bookData.cover?.medium || '',
  }
}
