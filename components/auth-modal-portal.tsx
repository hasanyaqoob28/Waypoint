'use client'

import { useEffect, useState } from 'react'
import { AuthModalOverlay } from '@/components/auth-modal-overlay'

interface AuthModalPortalProps {
  isLoggedIn: boolean
}

export function AuthModalPortal({ isLoggedIn: initialIsLoggedIn }: AuthModalPortalProps) {
  const [showModal, setShowModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn)

  useEffect(() => {
    // Check localStorage for demo auth user
    const checkLoggedIn = () => {
      const user = localStorage.getItem('demo_user')
      setIsLoggedIn(!!user)
      // Close modal if user just logged in
      if (user) {
        setShowModal(false)
      }
    }

    // Listen for sign-in button clicks
    const handleSignInClick = () => {
      setShowModal(true)
    }

    // Check immediately
    checkLoggedIn()

    // Listen for storage changes (from other tabs)
    window.addEventListener('storage', checkLoggedIn)
    window.addEventListener('open-auth-modal', handleSignInClick as EventListener)
    
    return () => {
      window.removeEventListener('storage', checkLoggedIn)
      window.removeEventListener('open-auth-modal', handleSignInClick as EventListener)
    }
  }, [])

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
