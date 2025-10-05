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

export async function fetchBookByTitle(title: string) {
  const res = await fetch(
    `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=5`
  )
  const data = await res.json()
  
  if (!data.docs || data.docs.length === 0) {
    throw new Error('Kein Buch gefunden')
  }

  // Gebe mehrere Ergebnisse zurück, damit Nutzer auswählen kann
  return data.docs.map((doc: any) => ({
    title: doc.title,
    authors: doc.author_name ? doc.author_name.join(', ') : 'Unbekannter Autor',
    coverUrl: doc.cover_i 
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : '',
    year: doc.first_publish_year || null,
  }))
}
