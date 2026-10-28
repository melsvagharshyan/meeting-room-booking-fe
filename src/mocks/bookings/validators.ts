import type { Booking, CreateBookingRequest } from '@/api/bookings-api-ts/types'
import {
  MAX_DURATION_MINUTES,
  MIN_DURATION_MINUTES,
  WORK_DAY_END,
  WORK_DAY_START,
} from './constants'
import { getBookingById, listBookingsByDate } from './store'
import {
  getDurationMinutes,
  isPastDate,
  isPastSlot,
  isValidTime,
  isWithinWorkDay,
  rangesOverlap,
} from './time'

export type ValidationFailure = {
  status: 400 | 404 | 409
  message: string
  code: 'VALIDATION_ERROR' | 'CONFLICT' | 'NOT_FOUND' | 'PAST_TIME'
}

function fail(
  status: ValidationFailure['status'],
  message: string,
  code: ValidationFailure['code'],
): ValidationFailure {
  return { status, message, code }
}

export function validateBookingPayload(
  payload: CreateBookingRequest,
  options: { excludeId?: string } = {},
): ValidationFailure | null {
  const { date, start, end, title } = payload

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return fail(400, 'Date must be in YYYY-MM-DD format.', 'VALIDATION_ERROR')
  }

  if (!isValidTime(start) || !isValidTime(end)) {
    return fail(400, 'Start and end must be valid HH:mm times.', 'VALIDATION_ERROR')
  }

  if (title !== undefined && title.length > 80) {
    return fail(400, 'Title must be 80 characters or fewer.', 'VALIDATION_ERROR')
  }

  if (!(start < end)) {
    return fail(400, 'Start time must be before end time.', 'VALIDATION_ERROR')
  }

  if (!isWithinWorkDay(start, end)) {
    return fail(
      400,
      `Bookings must stay within the working day (${WORK_DAY_START}–${WORK_DAY_END}).`,
      'VALIDATION_ERROR',
    )
  }

  const duration = getDurationMinutes(start, end)
  if (duration < MIN_DURATION_MINUTES) {
    return fail(
      400,
      `Minimum booking duration is ${MIN_DURATION_MINUTES} minutes.`,
      'VALIDATION_ERROR',
    )
  }

  if (duration > MAX_DURATION_MINUTES) {
    return fail(
      400,
      `Maximum booking duration is ${MAX_DURATION_MINUTES / 60} hours.`,
      'VALIDATION_ERROR',
    )
  }

  if (isPastDate(date)) {
    return fail(400, 'Cannot create or edit bookings on a past date.', 'PAST_TIME')
  }

  if (isPastSlot(date, start)) {
    const existing = options.excludeId
      ? getBookingById(options.excludeId)
      : undefined
    const keepingOriginalStart =
      existing !== undefined &&
      existing.date === date &&
      existing.start === start

    // Allow keeping the original start when editing an ongoing booking.
    if (!keepingOriginalStart) {
      return fail(
        400,
        'Cannot book a time slot that has already started.',
        'PAST_TIME',
      )
    }
  }

  const conflict = findConflict(date, start, end, options.excludeId)
  if (conflict) {
    return fail(
      409,
      `This slot conflicts with “${conflict.title ?? 'Untitled booking'}” (${conflict.start}–${conflict.end}).`,
      'CONFLICT',
    )
  }

  return null
}

export function findConflict(
  date: string,
  start: string,
  end: string,
  excludeId?: string,
): Booking | undefined {
  return listBookingsByDate(date).find((booking) => {
    if (excludeId && booking.id === excludeId) return false
    return rangesOverlap(start, end, booking.start, booking.end)
  })
}

export function assertBookingExists(id: string): ValidationFailure | Booking {
  const booking = getBookingById(id)
  if (!booking) {
    return fail(404, 'Booking not found.', 'NOT_FOUND')
  }
  return booking
}
