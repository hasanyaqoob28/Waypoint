'use client'

const DEMO_USER_KEY = 'demo_user'

export interface DemoUser {
  id: string
  email: string
  name: string
}

// Simple in-memory storage for demo (in real app would be database)
const demoUsers: Record<string, { email: string; name: string; password: string }> = {}

export function signUp(email: string, password: string, name: string): { success: boolean; error?: string; userId?: string } {
  // Check if user exists
  if (Object.values(demoUsers).some(u => u.email === email)) {
    return { success: false, error: 'Email already registered' }
  }

  // Create user
  const userId = `user_${Date.now()}`
  demoUsers[userId] = { email, password, name }
  
  // Store in localStorage
  if (typeof window !== 'undefined') {
    const user: DemoUser = { id: userId, email, name }
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user))
    localStorage.setItem(`${userId}_password`, password) // For demo only
  }

  return { success: true, userId }
}

export function signIn(email: string, password: string): { success: boolean; error?: string; userId?: string } {
  // Find user
  const userEntry = Object.entries(demoUsers).find(([_, u]) => u.email === email)
  
  if (!userEntry) {
    return { success: false, error: 'Email or password is incorrect' }
  }

  const [userId, user] = userEntry

  // Check password
  if (user.password !== password) {
    return { success: false, error: 'Email or password is incorrect' }
  }

  // Store in localStorage
  if (typeof window !== 'undefined') {
    const demoUser: DemoUser = { id: userId, email: user.email, name: user.name }
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser))
  }

  return { success: true, userId }
}

export function getCurrentUser(): DemoUser | null {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem(DEMO_USER_KEY)
    return user ? JSON.parse(user) : null
  }
  return null
}

export function signOut(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(DEMO_USER_KEY)
  }
}
