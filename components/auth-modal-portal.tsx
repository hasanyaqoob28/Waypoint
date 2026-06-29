'use client'

import { useEffect, useState } from 'react'
import { AuthModalOverlay } from '@/components/auth-modal-overlay'

interface AuthModalPortalProps {
  isLoggedIn: boolean
}

export function AuthModalPortal({ isLoggedIn }: AuthModalPortalProps) {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Listen for sign-in button clicks
    const handleSignInClick = () => {
      setShowModal(true)
    }

    window.addEventListener('open-auth-modal', handleSignInClick as EventListener)
    
    return () => {
      window.removeEventListener('open-auth-modal', handleSignInClick as EventListener)
    }
  }, [])

  // Don't show modal if user is logged in (checked via server cookie)
  if (isLoggedIn) {
    return null
  }

  return (
    <AuthModalOverlay 
      isOpen={showModal} 
      onClose={() => setShowModal(false)} 
    />
  )
}
