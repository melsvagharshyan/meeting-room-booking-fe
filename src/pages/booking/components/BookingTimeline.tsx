import type { KeyboardEvent, MouseEvent } from 'react'
import { Card, Typography } from 'antd'
import type { Booking } from '@/api/bookings-api-ts/types'
import {
  canSelectStart,
  getDefaultStartTime,
  getHourLabels,
  getTimelineHeightPercent,
  getTimelineOffsetPercent,
  getTimelineTotalHeight,
} from '../utils/helpers'
import { SLOT_STEP_MINUTES, WORK_DAY_END, WORK_DAY_START } from '../utils/constants'
import { minutesToTime, timeToMinutes } from '@/mocks/bookings/time'

type BookingTimelineProps = {
  date: string
  bookings: Booking[]
  selectedId?: string
  onSelectBooking: (booking: Booking) => void
  onSelectSlot: (start: string) => void
  disabled?: boolean
}

export function BookingTimeline({
  date,
  bookings,
  selectedId,
  onSelectBooking,
  onSelectSlot,
  disabled = false,
}: BookingTimelineProps) {
  const hours = getHourLabels()
  const height = getTimelineTotalHeight()

  const resolveStartFromClick = (event: MouseEvent<HTMLDivElement>): string | null => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientY - bounds.top) / bounds.height
    const dayStart = timeToMinutes(WORK_DAY_START)
    const dayEnd = timeToMinutes(WORK_DAY_END)
    const raw = dayStart + ratio * (dayEnd - dayStart)
    const snapped = Math.round(raw / SLOT_STEP_MINUTES) * SLOT_STEP_MINUTES
    const latestStart = dayEnd - 30
    const clamped = Math.min(Math.max(snapped, dayStart), latestStart)
    const candidate = minutesToTime(clamped)

    if (!canSelectStart(date, candidate)) {
      const fallback = getDefaultStartTime(date)
      return canSelectStart(date, fallback) ? fallback : null
    }

    return candidate
  }

  const handleBackgroundClick = (event: MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    const start = resolveStartFromClick(event)
    if (!start) return
    onSelectSlot(start)
  }

  const handleTrackKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    const start = getDefaultStartTime(date)
    if (!canSelectStart(date, start)) return
    onSelectSlot(start)
  }

  return (
    <Card
      className="h-full shadow-sm"
      title="Day timeline"
      extra={
        <Typography.Text type="secondary" className="!text-xs">
          {disabled ? 'Past date (read only)' : 'Click empty space to book'}
        </Typography.Text>
      }
    >
      <div className="relative grid grid-cols-[3.5rem_1fr]">
        <div className="relative" style={{ height }} aria-hidden>
          {hours.map((hour) => (
            <div
              key={hour}
              className="absolute right-2 -translate-y-1/2 text-xs text-slate-500"
              style={{ top: `${getTimelineOffsetPercent(hour)}%` }}
            >
              {hour}
            </div>
          ))}
          <div
            className="absolute right-2 text-xs text-slate-500"
            style={{ bottom: 0 }}
          >
            {WORK_DAY_END}
          </div>
        </div>

        <div
          className={[
            'timeline-track relative rounded-lg border border-dashed border-slate-200 bg-slate-50',
            disabled ? 'timeline-track--disabled' : 'timeline-track--active',
          ].join(' ')}
          style={{ height }}
          onClick={handleBackgroundClick}
          onKeyDown={handleTrackKeyDown}
          role={disabled ? 'presentation' : 'button'}
          tabIndex={disabled ? -1 : 0}
          aria-label={disabled ? 'Day timeline' : 'Day timeline, click to book'}
        >
          {hours.map((hour) => (
            <div
              key={hour}
              className="pointer-events-none absolute inset-x-0 border-t border-slate-100"
              style={{ top: `${getTimelineOffsetPercent(hour)}%` }}
            />
          ))}

          {bookings.map((booking) => {
            const top = getTimelineOffsetPercent(booking.start)
            const blockHeight = getTimelineHeightPercent(
              booking.start,
              booking.end,
            )
            const isSelected = booking.id === selectedId

            return (
              <button
                key={booking.id}
                type="button"
                disabled={disabled}
                className={[
                  'timeline-booking absolute inset-x-2 overflow-hidden rounded-lg border px-3 py-2 text-left transition',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600',
                  disabled ? 'timeline-booking--readonly' : '',
                  isSelected
                    ? 'border-teal-800 bg-teal-700 text-white shadow-md'
                    : 'border-teal-200 bg-teal-50 text-teal-950 hover:border-teal-300 hover:bg-teal-100',
                ].join(' ')}
                style={{
                  top: `${top}%`,
                  height: `${blockHeight}%`,
                  minHeight: 40,
                }}
                onClick={(event) => {
                  event.stopPropagation()
                  if (disabled) return
                  onSelectBooking(booking)
                }}
                aria-label={`${booking.title ?? 'Untitled booking'}, ${booking.start} to ${booking.end}`}
              >
                <span className="block truncate text-sm font-semibold">
                  {booking.title || 'Untitled booking'}
                </span>
                <span className="mt-0.5 block text-xs opacity-80">
                  {booking.start}–{booking.end}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
