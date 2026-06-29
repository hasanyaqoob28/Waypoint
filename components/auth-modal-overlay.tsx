'use client'

import { useState } from 'react'
import { AuthForm } from '@/components/auth-form'
import { X } from 'lucide-react'

interface AuthModalOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModalOverlay({ isOpen, onClose }: AuthModalOverlayProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/20">
      {/* Modal card - centered, using app's background color */}
      <div className="relative w-full max-w-md mx-4 bg-background rounded-2xl shadow-2xl overflow-hidden border border-border">
        {/* Decorative top gradient */}
        <div className="h-1 bg-gradient-to-r from-accent via-accent/70 to-accent/50" />
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              {mode === 'signup' ? 'Join Travelway' : 'Welcome Back'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === 'signup' 
                ? 'Create an account to save your trips'
                : 'Sign in to access your trips'}
            </p>
          </div>

          <AuthForm 
            mode={mode} 
            isModal={true}
            onModeChange={(newMode) => setMode(newMode)}
          />
        </div>
      </div>
    </div>
  )
}
