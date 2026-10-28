import { createApi } from '@reduxjs/toolkit/query/react'
import { mockBaseQuery } from './baseQuery'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: mockBaseQuery,
  tagTypes: ['Booking'],
  endpoints: () => ({}),
})
