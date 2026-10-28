import {
  MAX_DURATION_MINUTES,
  MIN_DURATION_MINUTES,
  WORK_DAY_END,
  WORK_DAY_START,
} from './constants'

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

export function isValidTime(value: string): boolean {
  return TIME_PATTERN.test(value)
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function getDurationMinutes(start: string, end: string): number {
  return timeToMinutes(end) - timeToMinutes(start)
}

export function isWithinWorkDay(start: string, end: string): boolean {
  const startMin = timeToMinutes(start)
  const endMin = timeToMinutes(end)
  return (
    startMin >= timeToMinutes(WORK_DAY_START) &&
    endMin <= timeToMinutes(WORK_DAY_END)
  )
}

export function isValidDuration(start: string, end: string): boolean {
  const duration = getDurationMinutes(start, end)
  return duration >= MIN_DURATION_MINUTES && duration <= MAX_DURATION_MINUTES
}

// Touching edges is ok: 10:00–11:00 and 11:00–12:00 do not overlap.
export function rangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return timeToMinutes(startA) < timeToMinutes(endB) && timeToMinutes(startB) < timeToMinutes(endA)
}

export function getTodayDateString(now = new Date()): string {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getCurrentTimeString(now = new Date()): string {
  return minutesToTime(now.getHours() * 60 + now.getMinutes())
}

export function isPastDate(date: string, now = new Date()): boolean {
  return date < getTodayDateString(now)
}

export function isPastSlot(date: string, start: string, now = new Date()): boolean {
  const today = getTodayDateString(now)
  if (date < today) return true
  if (date > today) return false
  return timeToMinutes(start) < timeToMinutes(getCurrentTimeString(now))
}
