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
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        ✓ You can create and explore unlimited trips without signing in.
      </p>
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
          <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
            <Button
              disabled
              size="sm"
              variant="secondary"
              className="opacity-50 cursor-not-allowed"
            >
              Sign in
            </Button>
            <span className="text-[10px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded">
              Coming soon
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
