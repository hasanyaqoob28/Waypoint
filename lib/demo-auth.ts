'use client'

const DEMO_USER_KEY = 'demo_user'
const DEMO_USERS_DB_KEY = 'demo_users_db'

export interface DemoUser {
  id: string
  email: string
  name: string
}

// Get all users from localStorage
function getAllUsers(): Record<string, { email: string; name: string; password: string }> {
  if (typeof window === 'undefined') return {}
  const stored = localStorage.getItem(DEMO_USERS_DB_KEY)
  return stored ? JSON.parse(stored) : {}
}

// Save all users to localStorage
function saveAllUsers(users: Record<string, { email: string; name: string; password: string }>) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DEMO_USERS_DB_KEY, JSON.stringify(users))
  }
}

export function signUp(email: string, password: string, name: string): { success: boolean; error?: string; userId?: string } {
  const demoUsers = getAllUsers()
  
  // Check if user exists
  if (Object.values(demoUsers).some(u => u.email === email)) {
    return { success: false, error: 'Email already registered' }
  }

  // Create user
  const userId = `user_${Date.now()}`
  demoUsers[userId] = { email, password, name }
  saveAllUsers(demoUsers)
  
  // Store current user in localStorage
  if (typeof window !== 'undefined') {
    const user: DemoUser = { id: userId, email, name }
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user))
    // Dispatch event to notify portal of login
    window.dispatchEvent(new StorageEvent('storage', { key: DEMO_USER_KEY }))
  }

  return { success: true, userId }
}

export function signIn(email: string, password: string): { success: boolean; error?: string; userId?: string } {
  const demoUsers = getAllUsers()
  
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

  // Store current user in localStorage
  if (typeof window !== 'undefined') {
    const demoUser: DemoUser = { id: userId, email: user.email, name: user.name }
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser))
    // Dispatch event to notify portal of login
    window.dispatchEvent(new StorageEvent('storage', { key: DEMO_USER_KEY }))
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
