'use client'

import { useEffect, useState } from 'react'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)
    window.addEventListener('online',  updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    updateOnlineStatus()
    return () => {
      window.removeEventListener('online',  updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 w-full bg-red-600 text-white text-center py-1 font-semibold">
      Offline Modus aktiv
    </div>
  )
}
