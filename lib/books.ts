export async function fetchBookByISBN(isbn: string) {
  const cleanISBN = isbn.replace(/-/g, '')
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanISBN}`
  )
  const data = await res.json()
  if (!data.items || data.items.length === 0) throw new Error('Buch nicht gefunden')

  const bookData = data.items[0].volumeInfo
  return {
    title: bookData.title || '',
    authors: bookData.authors ? bookData.authors.join(', ') : 'Unbekannter Autor',
    coverUrl: bookData.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
    description: bookData.description || '',
    publishedDate: bookData.publishedDate || ''
  }
}

export async function fetchBookByTitle(title: string) {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}&maxResults=10`
  )
  const data = await res.json()
  if (!data.items || data.items.length === 0) throw new Error('Kein Buch gefunden')

  return data.items.map((item: any) => {
    const info = item.volumeInfo
    return {
      title: info.title || '',
      authors: info.authors ? info.authors.join(', ') : 'Unbekannter Autor',
      coverUrl: info.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
      publishedDate: info.publishedDate || '',
    }
  })
}
