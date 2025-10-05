'use client'

import { useState } from 'react'
import BarcodeScannerComponent from 'react-qr-barcode-scanner'
import { X } from 'lucide-react'

interface ISBNScannerButtonProps {
  onISBNScanned: (isbn: string) => void
}

export function ISBNScannerButton({ onISBNScanned }: ISBNScannerButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastScanned, setLastScanned] = useState<string | null>(null)

  const handleUpdate = (err: any, result: any) => {
    if (err) {
      setError(err.message || 'Scanner Fehler')
      return
    }
    if (result) {
      const code = result.text
      if (code && !lastScanned) {
        setLastScanned(code)
        onISBNScanned(code)
        setIsOpen(false)
      }
    }
  }

  return (
    <>
      <button onClick={() => { setIsOpen(true); setLastScanned(null); setError(null) }} className="btn btn-primary">
        Buch per ISBN scannen
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center p-4 z-50">
          <div className="relative bg-base-100 rounded-lg shadow-md w-full max-w-md p-4">
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-ghost btn-sm btn-circle absolute top-2 right-2"
              aria-label="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold mb-2 text-center">ISBN Code scannen</h2>
            {error && <p className="text-error mb-2">{error}</p>}
            <BarcodeScannerComponent
              width={300}
              height={300}
              onUpdate={handleUpdate}
            />
          </div>
        </div>
      )}
    </>
  )
}
