import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import type { ApiError, ApiErrorBody } from '@/api/bookings-api-ts/types'
import {
  handleCreateBooking,
  handleDeleteBooking,
  handleListBookings,
  handleUpdateBooking,
} from '@/mocks/bookings/handlers'
import type {
  CreateBookingRequest,
  UpdateBookingRequest,
} from '@/api/bookings-api-ts/types'

type MockArgs = {
  url: string
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  params?: Record<string, string>
}

// Mock API transport. Replace with fetchBaseQuery({ baseUrl: '/api' }) for a real backend.
export const mockBaseQuery: BaseQueryFn<MockArgs, unknown, ApiError> = async ({
  url,
  method = 'GET',
  body,
  params,
}) => {
  const response = await routeMockRequest({ url, method, body, params })

  if (!response.ok) {
    return {
      error: {
        status: response.status,
        data: response.data,
      },
    }
  }

  return { data: response.data }
}

async function routeMockRequest({ url, method, body, params }: MockArgs) {
  if (url === '/bookings' && method === 'GET') {
    return handleListBookings(params?.date ?? '')
  }

  if (url === '/bookings' && method === 'POST') {
    return handleCreateBooking(body as CreateBookingRequest)
  }

  const bookingMatch = url.match(/^\/bookings\/([^/]+)$/)
  if (bookingMatch) {
    const id = bookingMatch[1]

    if (method === 'PATCH') {
      return handleUpdateBooking({
        id,
        ...(body as Omit<UpdateBookingRequest, 'id'>),
      })
    }

    if (method === 'DELETE') {
      return handleDeleteBooking(id)
    }
  }

  return {
    ok: false as const,
    status: 404,
    data: { message: 'Not found.', code: 'NOT_FOUND' } satisfies ApiErrorBody,
  }
}
