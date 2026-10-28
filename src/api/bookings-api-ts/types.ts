export type Booking = {
  id: string
  date: string
  start: string
  end: string
  title?: string
}

export type CreateBookingRequest = {
  date: string
  start: string
  end: string
  title?: string
}

export type UpdateBookingRequest = {
  id: string
  date?: string
  start?: string
  end?: string
  title?: string
}

export type ApiErrorBody = {
  message: string
  code?: 'VALIDATION_ERROR' | 'CONFLICT' | 'NOT_FOUND' | 'PAST_TIME'
}

export type ApiError = {
  status: number
  data: ApiErrorBody
}
