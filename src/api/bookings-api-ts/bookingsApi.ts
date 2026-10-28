import { api } from '../api'
import type { Booking, CreateBookingRequest, UpdateBookingRequest } from './types'

const base = '/bookings'

export const bookingsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getBookingsByDate: build.query<Booking[], { date: string }>({
      query: ({ date }) => ({
        url: base,
        method: 'GET',
        params: { date },
      }),
      providesTags: (result, _error, { date }) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Booking' as const, id })),
              { type: 'Booking', id: `LIST-${date}` },
            ]
          : [{ type: 'Booking', id: `LIST-${date}` }],
    }),

    createBooking: build.mutation<Booking, CreateBookingRequest>({
      query: (body) => ({
        url: base,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Booking', id: `LIST-${arg.date}` },
      ],
    }),

    updateBooking: build.mutation<Booking, UpdateBookingRequest>({
      query: ({ id, ...body }) => ({
        url: `${base}/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, _error, arg) => {
        const tags: Array<{ type: 'Booking'; id: string }> = [
          { type: 'Booking', id: arg.id },
        ]
        if (arg.date) {
          tags.push({ type: 'Booking', id: `LIST-${arg.date}` })
        }
        if (result?.date) {
          tags.push({ type: 'Booking', id: `LIST-${result.date}` })
        }
        return tags
      },
    }),

    deleteBooking: build.mutation<{ id: string }, { id: string; date: string }>({
      query: ({ id }) => ({
        url: `${base}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Booking', id: arg.id },
        { type: 'Booking', id: `LIST-${arg.date}` },
      ],
    }),
  }),
})

export const {
  useGetBookingsByDateQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
} = bookingsApi
