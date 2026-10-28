import type { Booking } from '@/api/bookings-api-ts/types'

export type BookingFormValues = {
  title: string
  start: string
  end: string
}

export type BookingEditorMode = 'create' | 'edit'

export type BookingEditorState =
  | { mode: 'create'; preset?: Partial<BookingFormValues> }
  | { mode: 'edit'; booking: Booking }
