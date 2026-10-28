import type { Booking, ApiError } from '@/api/bookings-api-ts/types'
import {
  getCurrentTimeString,
  getTodayDateString,
  isPastDate,
  isPastSlot,
  minutesToTime,
  rangesOverlap,
  timeToMinutes,
} from '@/mocks/bookings/time'
import {
  MAX_DURATION_MINUTES,
  MIN_DURATION_MINUTES,
  SLOT_STEP_MINUTES,
  TIMELINE_HOUR_HEIGHT_PX,
  WORK_DAY_END,
  WORK_DAY_START,
} from './constants'

export function formatDateLabel(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

export function formatDurationLabel(start: string, end: string): string {
  const minutes = timeToMinutes(end) - timeToMinutes(start)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (rest === 0) return hours === 1 ? '1 hour' : `${hours} hours`
  return `${hours}h ${rest}m`
}

export function buildTimeOptions(stepMinutes = SLOT_STEP_MINUTES): string[] {
  const start = timeToMinutes(WORK_DAY_START)
  const end = timeToMinutes(WORK_DAY_END)
  const times: string[] = []

  for (let minutes = start; minutes <= end; minutes += stepMinutes) {
    times.push(minutesToTime(minutes))
  }

  return times
}

export function getDefaultStartTime(date: string, now = new Date()): string {
  if (isPastDate(date, now)) {
    return WORK_DAY_START
  }

  if (date === getTodayDateString(now)) {
    const current = timeToMinutes(getCurrentTimeString(now))
    const rounded = Math.ceil(current / SLOT_STEP_MINUTES) * SLOT_STEP_MINUTES
    const workStart = timeToMinutes(WORK_DAY_START)
    const latestStart =
      timeToMinutes(WORK_DAY_END) - MIN_DURATION_MINUTES

    const candidate = Math.max(workStart, rounded)
    if (candidate > latestStart) {
      return minutesToTime(workStart)
    }
    return minutesToTime(candidate)
  }

  return WORK_DAY_START
}

export function getDefaultEndTime(start: string): string {
  const end = timeToMinutes(start) + MIN_DURATION_MINUTES
  const workEnd = timeToMinutes(WORK_DAY_END)
  return minutesToTime(Math.min(end, workEnd))
}

export function getHourLabels(): string[] {
  const labels: string[] = []
  for (
    let minutes = timeToMinutes(WORK_DAY_START);
    minutes < timeToMinutes(WORK_DAY_END);
    minutes += 60
  ) {
    labels.push(minutesToTime(minutes))
  }
  return labels
}

export function getTimelineOffsetPercent(time: string): number {
  const start = timeToMinutes(WORK_DAY_START)
  const end = timeToMinutes(WORK_DAY_END)
  const value = timeToMinutes(time)
  return ((value - start) / (end - start)) * 100
}

export function getTimelineHeightPercent(start: string, end: string): number {
  const dayStart = timeToMinutes(WORK_DAY_START)
  const dayEnd = timeToMinutes(WORK_DAY_END)
  return ((timeToMinutes(end) - timeToMinutes(start)) / (dayEnd - dayStart)) * 100
}

export function getTimelineTotalHeight(): number {
  const hours =
    (timeToMinutes(WORK_DAY_END) - timeToMinutes(WORK_DAY_START)) / 60
  return hours * TIMELINE_HOUR_HEIGHT_PX
}

export function findOverlappingBooking(
  bookings: Booking[],
  start: string,
  end: string,
  excludeId?: string,
): Booking | undefined {
  return bookings.find((booking) => {
    if (excludeId && booking.id === excludeId) return false
    return rangesOverlap(start, end, booking.start, booking.end)
  })
}

export function isDateBookable(date: string, now = new Date()): boolean {
  return !isPastDate(date, now)
}

export function canSelectStart(
  date: string,
  start: string,
  options: { allowStart?: string; now?: Date } = {},
): boolean {
  const now = options.now ?? new Date()
  if (!isDateBookable(date, now)) return false

  const keepingAllowedStart =
    options.allowStart !== undefined && start === options.allowStart

  if (isPastSlot(date, start, now) && !keepingAllowedStart) return false

  const latestStart = timeToMinutes(WORK_DAY_END) - MIN_DURATION_MINUTES
  return timeToMinutes(start) <= latestStart
}

export function canSelectEnd(start: string, end: string): boolean {
  if (!(start < end)) return false
  const duration = timeToMinutes(end) - timeToMinutes(start)
  return (
    duration >= MIN_DURATION_MINUTES &&
    duration <= MAX_DURATION_MINUTES &&
    timeToMinutes(end) <= timeToMinutes(WORK_DAY_END)
  )
}

export function isApiError(error: unknown): error is { status: number; data: ApiError['data'] } {
  if (!error || typeof error !== 'object') return false
  if (!('status' in error) || !('data' in error)) return false
  const data = (error as ApiError).data
  return Boolean(data && typeof data.message === 'string')
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (isApiError(error)) {
    return error.data.message || fallback
  }
  return fallback
}

export function shiftDate(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number)
  const next = new Date(year, month - 1, day)
  next.setDate(next.getDate() + days)
  return getTodayDateString(next)
}
