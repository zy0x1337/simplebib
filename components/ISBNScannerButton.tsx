'use client'

import { useState, useEffect } from 'react'
import BarcodeScannerComponent from 'react-qr-barcode-scanner'
import { X } from 'lucide-react'

interface ISBNScannerButtonProps {
  onISBNScanned: (isbn: string) => void
}

export function ISBNScannerButton({ onISBNScanned }: ISBNScannerButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  const [cameraAccessible, setCameraAccessible] = useState<boolean | null>(null)

  useEffect(() => {
    // Prüfe Kamera-Zugriffsrechte
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraAccessible(false)
    } else {
      navigator.permissions.query({ name: 'camera' as PermissionName }).then((result) => {
        setCameraAccessible(result.state !== 'denied')
      }).catch(() => setCameraAccessible(null))
    }
  }, [])

  const handleUpdate = (err: any, result: any) => {
    if (err) {
      setError(err.message || 'Fehler beim Scannen')
      console.error('Scannerfehler:', err)
      return
    }
    if (result) {
      const code = result.text
      console.log('Barcode erkannt:', code)
      // EAN13 ist üblicherweise ISBN - Validierung optional hier möglich
      if (code && !lastScanned) {
        setLastScanned(code)
        onISBNScanned(code)
        setIsOpen(false)
      }
    }
  }

  const openScanner = () => {
    setError(null)
    setLastScanned(null)
    setIsOpen(true)
  }

  return (
    <>
      <button onClick={openScanner} className="btn btn-primary">
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
            {cameraAccessible === false && (
              <p className="text-error mb-2">Kein Kamerazugriff möglich. Bitte Berechtigungen prüfen.</p>
            )}
            {error && <p className="text-error mb-2">Fehler: {error}</p>}
            <BarcodeScannerComponent
              width={320}
              height={320}
              onUpdate={handleUpdate}
              facingMode="environment" // Rückkamera bevorzugt
            />
          </div>
        </div>
      )}
    </>
  )
}
