import { useEffect, useState, useCallback, useRef } from 'react'

export function useRegistrationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasTrip = typeof window !== 'undefined' && localStorage.getItem('hasViewedTrip') === 'true'
  const hasShownPromptRef = useRef(false)

  // Handle page refresh - show prompt if user had viewed a trip
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasTrip && !hasShownPromptRef.current) {
        e.preventDefault()
        e.returnValue = ''
        setShowPrompt(true)
        hasShownPromptRef.current = true
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasTrip])

  // Handle inactivity - show prompt after 60 seconds of no activity
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current)
    }

    if (hasTrip && !hasShownPromptRef.current) {
      inactivityTimeoutRef.current = setTimeout(() => {
        setShowPrompt(true)
        hasShownPromptRef.current = true
      }, 60000) // 60 seconds
    }
  }, [hasTrip])

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    
    events.forEach(event => {
      window.addEventListener(event, resetInactivityTimer)
    })

    resetInactivityTimer() // Start the timer on mount

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer)
      })
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current)
      }
    }
  }, [resetInactivityTimer])

  const closePrompt = useCallback(() => {
    setShowPrompt(false)
  }, [])

  return { showPrompt, closePrompt }
}
