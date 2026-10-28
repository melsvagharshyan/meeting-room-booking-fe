import { z } from 'zod'
import {
  getDurationMinutes,
  isPastDate,
  isPastSlot,
  isValidTime,
  isWithinWorkDay,
} from '@/mocks/bookings/time'
import {
  MAX_DURATION_MINUTES,
  MIN_DURATION_MINUTES,
  WORK_DAY_END,
  WORK_DAY_START,
} from './constants'
import { findOverlappingBooking } from './helpers'
import type { Booking } from '@/api/bookings-api-ts/types'

export function createBookingFormSchema(options: {
  date: string
  bookings: Booking[]
  excludeId?: string
  originalStart?: string
}) {
  return z
    .object({
      title: z.string().max(80, 'Title must be 80 characters or fewer.'),
      start: z.string().min(1, 'Start time is required.'),
      end: z.string().min(1, 'End time is required.'),
    })
    .superRefine((values, ctx) => {
      const { start, end } = values

      if (!isValidTime(start)) {
        ctx.addIssue({
          code: 'custom',
          path: ['start'],
          message: 'Choose a valid start time.',
        })
        return
      }

      if (!isValidTime(end)) {
        ctx.addIssue({
          code: 'custom',
          path: ['end'],
          message: 'Choose a valid end time.',
        })
        return
      }

      if (!(start < end)) {
        ctx.addIssue({
          code: 'custom',
          path: ['end'],
          message: 'End time must be after start time.',
        })
        return
      }

      if (!isWithinWorkDay(start, end)) {
        ctx.addIssue({
          code: 'custom',
          path: ['start'],
          message: `Stay within ${WORK_DAY_START}–${WORK_DAY_END}.`,
        })
        return
      }

      const duration = getDurationMinutes(start, end)
      if (duration < MIN_DURATION_MINUTES) {
        ctx.addIssue({
          code: 'custom',
          path: ['end'],
          message: `Minimum duration is ${MIN_DURATION_MINUTES} minutes.`,
        })
      }

      if (duration > MAX_DURATION_MINUTES) {
        ctx.addIssue({
          code: 'custom',
          path: ['end'],
          message: `Maximum duration is ${MAX_DURATION_MINUTES / 60} hours.`,
        })
      }

      if (isPastDate(options.date)) {
        ctx.addIssue({
          code: 'custom',
          path: ['start'],
          message: 'Cannot book on a past date.',
        })
        return
      }

      const keepingOriginalStart =
        options.originalStart !== undefined && start === options.originalStart

      if (isPastSlot(options.date, start) && !keepingOriginalStart) {
        ctx.addIssue({
          code: 'custom',
          path: ['start'],
          message: 'This start time has already passed.',
        })
      }

      const conflict = findOverlappingBooking(
        options.bookings,
        start,
        end,
        options.excludeId,
      )
      if (conflict) {
        ctx.addIssue({
          code: 'custom',
          path: ['start'],
          message: `Conflicts with “${conflict.title ?? 'Untitled'}” (${conflict.start}–${conflict.end}).`,
        })
      }
    })
}

export type BookingFormSchema = z.infer<ReturnType<typeof createBookingFormSchema>>
