import type {
  ApiErrorBody,
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
} from '@/api/bookings-api-ts/types'
import { MOCK_NETWORK_DELAY_MS } from './constants'
import {
  getBookingById,
  insertBooking,
  listBookingsByDate,
  removeBooking,
  replaceBooking,
} from './store'
import { assertBookingExists, validateBookingPayload } from './validators'

export type MockResponse<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; data: ApiErrorBody }

function delay(ms = MOCK_NETWORK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function error(
  status: number,
  message: string,
  code: ApiErrorBody['code'],
): MockResponse<never> {
  return { ok: false, status, data: { message, code } }
}

export async function handleListBookings(date: string): Promise<MockResponse<Booking[]>> {
  await delay()

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return error(400, 'Query param “date” (YYYY-MM-DD) is required.', 'VALIDATION_ERROR')
  }

  return { ok: true, status: 200, data: listBookingsByDate(date) }
}

export async function handleCreateBooking(
  body: CreateBookingRequest,
): Promise<MockResponse<Booking>> {
  await delay()

  const validationError = validateBookingPayload(body)
  if (validationError) {
    return error(validationError.status, validationError.message, validationError.code)
  }

  return { ok: true, status: 201, data: insertBooking(body) }
}

export async function handleUpdateBooking(
  request: UpdateBookingRequest,
): Promise<MockResponse<Booking>> {
  await delay()

  const existing = assertBookingExists(request.id)
  if ('status' in existing) {
    return error(existing.status, existing.message, existing.code)
  }

  const nextPayload: CreateBookingRequest = {
    date: request.date ?? existing.date,
    start: request.start ?? existing.start,
    end: request.end ?? existing.end,
    title: request.title !== undefined ? request.title : existing.title,
  }

  const validationError = validateBookingPayload(nextPayload, {
    excludeId: request.id,
  })
  if (validationError) {
    return error(validationError.status, validationError.message, validationError.code)
  }

  const updated = replaceBooking(request.id, {
    id: request.id,
    ...nextPayload,
    title: nextPayload.title?.trim() || undefined,
  })

  return { ok: true, status: 200, data: updated }
}

export async function handleDeleteBooking(id: string): Promise<MockResponse<{ id: string }>> {
  await delay()

  if (!getBookingById(id)) {
    return error(404, 'Booking not found.', 'NOT_FOUND')
  }

  removeBooking(id)
  return { ok: true, status: 200, data: { id } }
}
