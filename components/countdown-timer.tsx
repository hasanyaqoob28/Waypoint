import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface CountdownTimerProps {
  departureTime: string | null
  flightNumber?: string
}

export function CountdownTimer({ departureTime, flightNumber }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    if (!departureTime) return

    const updateCountdown = () => {
      const now = new Date()
      const departure = new Date(departureTime)
      const diff = departure.getTime() - now.getTime()

      if (diff < 0) {
        setTimeLeft('Departed')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`)
      } else {
        setTimeLeft(`${minutes}m`)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [departureTime])

  if (!timeLeft) return null

  return (
    <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm font-medium text-accent">
      <Clock className="size-4" />
      <span>{timeLeft}</span>
    </div>
  )
}
