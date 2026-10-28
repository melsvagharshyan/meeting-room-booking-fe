import type { Booking, CreateBookingRequest } from '@/api/bookings-api-ts/types'
import { getTodayDateString, minutesToTime, timeToMinutes } from './time'

function createId(): string {
  return crypto.randomUUID()
}

function seedBookings(): Booking[] {
  const today = getTodayDateString()
  const [year, month, day] = today.split('-').map(Number)
  const tomorrowDate = new Date(year, month - 1, day + 1)
  const tomorrow = getTodayDateString(tomorrowDate)

  return [
    {
      id: createId(),
      date: today,
      start: '10:00',
      end: '11:00',
      title: 'Product sync',
    },
    {
      id: createId(),
      date: today,
      start: '14:00',
      end: '15:30',
      title: 'Design review',
    },
    {
      id: createId(),
      date: tomorrow,
      start: '11:00',
      end: '12:00',
      title: 'Sprint planning',
    },
  ]
}

let bookings: Booking[] = seedBookings()

export function listBookingsByDate(date: string): Booking[] {
  return bookings
    .filter((booking) => booking.date === date)
    .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
}

export function getBookingById(id: string): Booking | undefined {
  return bookings.find((booking) => booking.id === id)
}

export function insertBooking(payload: CreateBookingRequest): Booking {
  const booking: Booking = {
    id: createId(),
    date: payload.date,
    start: payload.start,
    end: payload.end,
    title: payload.title?.trim() || undefined,
  }
  bookings = [...bookings, booking]
  return booking
}

export function replaceBooking(id: string, next: Booking): Booking {
  bookings = bookings.map((booking) => (booking.id === id ? next : booking))
  return next
}

export function removeBooking(id: string): boolean {
  const before = bookings.length
  bookings = bookings.filter((booking) => booking.id !== id)
  return bookings.length < before
}

export function __resetBookings(next: Booking[] = seedBookings()): void {
  bookings = next
}

export function roundUpToStep(time: string, stepMinutes: number): string {
  const minutes = timeToMinutes(time)
  const rounded = Math.ceil(minutes / stepMinutes) * stepMinutes
  return minutesToTime(rounded)
}
