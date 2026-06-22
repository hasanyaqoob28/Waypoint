import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(timeStr: string): string {
  // Extract just HH:MM from "HH:MM AM/PM" or "HH:MM" formats
  const match = timeStr.match(/(\d{1,2}):(\d{2})/)
  if (!match) return timeStr
  
  const [, hh, mm] = match
  const hours = parseInt(hh, 10)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  
  return `${displayHours}:${mm} ${period}`
}
