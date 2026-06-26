'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Zap, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STEPS = [
  {
    icon: Mail,
    title: 'Paste Your Email',
    description: 'Copy your booking confirmation and paste it here',
    visual: '✉️',
  },
  {
    icon: Zap,
    title: 'AI Parses It',
    description: 'Travelway extracts flights, hotels, and plans',
    visual: '⚡',
  },
  {
    icon: CheckCircle2,
    title: 'See Your Timeline',
    description: 'Beautiful itinerary with countdown timers',
    visual: '📅',
  },
]

export function MobileWalkthrough() {
  const [isOpen, setIsOpen] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)

  // Auto-cycle through steps
  useEffect(() => {
    if (!isOpen) return
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % STEPS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [isOpen])

  if (!isOpen) return null

  const step = STEPS[currentStep]

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 lg:hidden">
      <div className="w-full animate-in slide-in-from-bottom-5 rounded-t-2xl border-t border-border bg-background p-6">
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            How to use
          </p>
        </div>

        {/* Visual - Big emoji/icon */}
        <div className="mb-6 text-center">
          <div className="text-6xl">{step.visual}</div>
        </div>

        {/* Content */}
        <div className="space-y-2 text-center">
          <h2 className="text-lg font-semibold text-foreground">{step.title}</h2>
          <p className="text-sm text-muted-foreground">{step.description}</p>
        </div>

        {/* Progress dots */}
        <div className="mt-6 flex justify-center gap-2">
          {STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentStep
                  ? 'w-6 bg-primary'
                  : 'w-2 bg-secondary hover:bg-secondary/80'
              }`}
            />
          ))}
        </div>

        {/* Action button */}
        <Button
          onClick={() => setIsOpen(false)}
          variant="default"
          className="mt-6 w-full"
        >
          {currentStep === STEPS.length - 1 ? 'Got it!' : 'Next'}
        </Button>
      </div>
    </div>
  )
}
