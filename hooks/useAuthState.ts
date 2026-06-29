'use client'

import { useEffect, useState } from 'react'

export interface AuthUser {
  id: string
  email: string
  name?: string
}

export function useAuthState() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch current user from the server
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.log('[v0] Error checking auth:', error)
        setUser(null)
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const logout = async () => {
    try {
      await fetch('/api/auth/sign-out', { method: 'POST' })
      setUser(null)
    } catch (error) {
      console.log('[v0] Logout error:', error)
    }
  }

  return {
    user,
    isLoggedIn: !!user,
    isLoading,
    logout,
  }
}
