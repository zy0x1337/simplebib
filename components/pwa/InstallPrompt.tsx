'use client'

import { useEffect, useState } from 'react'

interface InstallPromptState {
  canInstall: boolean
  deferredPrompt: any | null
  isInstalled: boolean
}

export function InstallPrompt() {
  const [installState, setInstallState] = useState<InstallPromptState>({
    canInstall: false,
    deferredPrompt: null,
    isInstalled: false,
  })

  useEffect(() => {
    if ('getInstallationState' in navigator) {
      ;(navigator as any).getInstallationState().then((installed: boolean) => {
        setInstallState((state) => ({ ...state, isInstalled: installed }))
      })
    }

    const beforeInstallHandler = (e: any) => {
      e.preventDefault()
      setInstallState((state) => ({ ...state, canInstall: true, deferredPrompt: e }))
    }

    window.addEventListener('beforeinstallprompt', beforeInstallHandler)

    window.addEventListener('appinstalled', () => {
      setInstallState({ canInstall: false, deferredPrompt: null, isInstalled: true })
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallHandler)
    }
  }, [])

  const handleInstallClick = () => {
    installState.deferredPrompt?.prompt()
    installState.deferredPrompt?.userChoice.then(() => {
      setInstallState({ canInstall: false, deferredPrompt: null, isInstalled: false })
    })
  }

  if (!installState.canInstall) return null

  return (
    <div className="fixed bottom-4 right-4 bg-indigo-600 text-white p-3 rounded shadow-lg cursor-pointer" onClick={handleInstallClick}>
      App installieren
    </div>
  )
}
