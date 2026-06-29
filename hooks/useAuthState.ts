'use client'

import { useEffect, useState } from 'react'

export interface AuthUser {
  id: string
  email: string
  name: string
}

export function useAuthState() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for logged-in user
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('demo_user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('[v0] Error checking auth:', error)
        setUser(null)
      }
      setIsLoading(false)
    }

    checkAuth()

    // Listen for storage changes (from other tabs/windows)
    window.addEventListener('storage', checkAuth)

    return () => {
      window.removeEventListener('storage', checkAuth)
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('demo_user')
    localStorage.removeItem('demo_users_db')
    setUser(null)
  }

  return {
    user,
    isLoggedIn: !!user,
    isLoading,
    logout,
  }
}
