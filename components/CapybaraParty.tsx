'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export function CapybaraParty() {
  const [capybaras, setCapybaras] = useState<Array<{ 
    id: number
    left: number
    delay: number
    duration: number
    size: number
    bounce: number
  }>>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Generiere 8-12 Party Capybaras
    const capybaraCount = Math.floor(Math.random() * 5) + 8
    const newCapybaras = Array.from({ length: capybaraCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: Math.random() * 3 + 6, // 6-9 Sekunden
      size: Math.random() * 0.6 + 0.8, // 0.8-1.4 Größenfaktor
      bounce: Math.random() * 40 + 20, // Bounce-Höhe
    }))
    
    setCapybaras(newCapybaras)

    const timeout = setTimeout(() => {
      setCapybaras([])
    }, 10000)

    return () => clearTimeout(timeout)
  }, [])

  if (!mounted || capybaras.length === 0) return null

  return createPortal(
    <>
      {/* Konfetti Hintergrund */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{ 
          zIndex: 99998,
          animation: 'party-flash 0.8s ease-out',
        }}
      />
      
      {/* Capybaras */}
      <div 
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 99999 }}
      >
        {capybaras.map((capy) => (
          <div
            key={capy.id}
            className="absolute"
            style={{
              top: '-120px',
              left: `${capy.left}%`,
              fontSize: `${capy.size * 3}rem`,
              animation: `capybara-fall ${capy.duration}s ease-in-out ${capy.delay}s forwards`,
              textShadow: '0 4px 8px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              animation: `capybara-wiggle ${capy.duration * 0.3}s ease-in-out ${capy.delay}s infinite`,
            }}>
              <div style={{ fontSize: '0.4em', marginBottom: '-0.2em' }}>🎉</div>
              <div>🦫</div>
            </div>
          </div>
        ))}
        
        {/* Bunte Konfetti */}
        {Array.from({ length: 40 }, (_, i) => {
          const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#ff9ff3', '#54a0ff']
          return (
            <div
              key={`confetti-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 8 + 4}px`,
                height: `${Math.random() * 8 + 4}px`,
                backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `confetti-spin ${Math.random() * 3 + 2}s ease-in-out ${Math.random() * 1}s infinite`,
                opacity: 0.8,
              }}
            />
          )
        })}
        
        {/* Party Ballons */}
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={`balloon-${i}`}
            className="absolute text-4xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: '110%',
              animation: `balloon-rise ${Math.random() * 6 + 8}s ease-in-out ${Math.random() * 2}s forwards`,
            }}
          >
            🎈
          </div>
        ))}
      </div>
    </>,
    document.body
  )
}
