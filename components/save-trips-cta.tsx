'use client'

import { useState } from 'react'
import { AuthModalOverlay } from '@/components/auth-modal-overlay'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'

interface SaveTripsCTAProps {
  isLoggedIn: boolean
}

export function SaveTripsCTA({ isLoggedIn }: SaveTripsCTAProps) {
  const [showAuthModal, setShowAuthModal] = useState(false)

  if (isLoggedIn) {
    return null
  }

  return (
    <>
      <Card className="border-accent/30 bg-accent/5 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Lock className="size-5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground text-sm">
                Save your trips
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Create an account to save multiple trips and access them anytime from any device.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowAuthModal(true)}
            size="sm"
            className="flex-shrink-0"
          >
            Sign in
          </Button>
        </div>
      </Card>

      <AuthModalOverlay isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}
