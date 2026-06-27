import { useEffect, useCallback } from 'react'

// This hook shows a browser confirmation when user tries to refresh/leave the page
// after viewing a trip. Prompts them to save their trip before leaving.

export function useRegistrationPrompt() {
  // Listen for page refresh/unload and warn if user has viewed a trip
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasViewedTrip = typeof window !== 'undefined' && localStorage.getItem('hasViewedTrip') === 'true'
      
      if (hasViewedTrip) {
        // Show browser's default confirmation dialog
        e.preventDefault()
        e.returnValue = 'Your trip data will be lost. Sign up to save your trips permanently!'
        return 'Your trip data will be lost. Sign up to save your trips permanently!'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  const closePrompt = useCallback(() => {
    // No-op for page refresh - user handles via browser dialog
  }, [])

  return { showPrompt: false, closePrompt }
}
