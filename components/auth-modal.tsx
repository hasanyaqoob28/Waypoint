'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AuthForm } from '@/components/auth-form'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
}

export function AuthModal({ isOpen, onClose, title = 'Save Your Trips' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</DialogTitle>
          <DialogDescription>
            {mode === 'login'
              ? 'Sign in to access your saved trips'
              : 'Create an account to save and access your trips from anywhere'}
          </DialogDescription>
        </DialogHeader>
        <AuthForm mode={mode} onModeChange={setMode} isModal={true} />
      </DialogContent>
    </Dialog>
  )
}
