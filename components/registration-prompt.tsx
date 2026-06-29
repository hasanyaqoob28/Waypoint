'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RegistrationPromptProps {
  isVisible: boolean
  onClose: () => void
}

export function RegistrationPrompt({ isVisible, onClose }: RegistrationPromptProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-lg">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 hover:bg-secondary rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Save Your Trip
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create an account to save your itinerary and access it anytime. Coming soon!
            </p>
          </div>

          {/* Benefits list */}
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1 text-accent">✓</span>
              <span>Save multiple trips</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-accent">✓</span>
              <span>Access from any device</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-accent">✓</span>
              <span>Get real-time notifications</span>
            </li>
          </ul>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              onClick={onClose}
              className="flex-1"
              disabled
            >
              Coming Soon
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
