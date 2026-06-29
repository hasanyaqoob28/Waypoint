'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'

interface SaveTripsCTAProps {
  isLoggedIn: boolean
}

export function SaveTripsCTA({ isLoggedIn }: SaveTripsCTAProps) {
  if (isLoggedIn) {
    return null
  }

  return (
    <Card className="border-accent/20 bg-accent/5 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <Lock className="size-4 text-accent mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-xs">
              <span className="text-foreground">Save your trips</span>
              <span className="text-accent ml-1">[Coming soon]</span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
              Create an account to save trips anytime, anywhere.
            </p>
          </div>
        </div>
        <Button
          disabled
          size="xs"
          variant="secondary"
          className="opacity-50 cursor-not-allowed text-[11px] flex-shrink-0"
        >
          Sign in
        </Button>
      </div>
    </Card>
  )
}
