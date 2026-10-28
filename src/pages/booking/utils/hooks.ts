import { useEffect, useMemo, useState } from 'react'
import {
  useCreateBookingMutation,
  useDeleteBookingMutation,
  useGetBookingsByDateQuery,
  useUpdateBookingMutation,
} from '@/api/bookings-api-ts/bookingsApi'
import type { Booking } from '@/api/bookings-api-ts/types'
import { getTodayDateString } from '@/mocks/bookings/time'
import {
  getDefaultEndTime,
  getDefaultStartTime,
  isDateBookable,
  shiftDate,
} from './helpers'
import type { BookingEditorState, BookingFormValues } from './types'

export function useBookingPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString)
  const [editor, setEditor] = useState<BookingEditorState | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  useEffect(() => {
    setEditor(null)
    setServerError(null)
    setPendingDeleteId(null)
  }, [selectedDate])

  const {
    currentData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetBookingsByDateQuery({ date: selectedDate })

  const bookings = currentData ?? []
  const showLoading = isLoading || (isFetching && currentData === undefined)

  const [createBooking, createState] = useCreateBookingMutation()
  const [updateBooking, updateState] = useUpdateBookingMutation()
  const [deleteBooking, deleteState] = useDeleteBookingMutation()

  const isPastSelectedDate = !isDateBookable(selectedDate)
  const isSubmitting = createState.isLoading || updateState.isLoading

  const openCreate = (preset?: Partial<BookingFormValues>) => {
    if (isPastSelectedDate) return
    setServerError(null)
    setEditor({ mode: 'create', preset })
  }

  const openEdit = (booking: Booking) => {
    if (isPastSelectedDate) return
    setServerError(null)
    setEditor({ mode: 'edit', booking })
  }

  const closeEditor = () => {
    setEditor(null)
    setServerError(null)
  }

  const defaultFormValues = useMemo<BookingFormValues>(() => {
    if (editor?.mode === 'edit') {
      return {
        title: editor.booking.title ?? '',
        start: editor.booking.start,
        end: editor.booking.end,
      }
    }

    const start =
      editor?.preset?.start ?? getDefaultStartTime(selectedDate)
    const end = editor?.preset?.end ?? getDefaultEndTime(start)

    return {
      title: editor?.preset?.title ?? '',
      start,
      end,
    }
  }, [editor, selectedDate])

  const goToPreviousDay = () => setSelectedDate((date) => shiftDate(date, -1))
  const goToNextDay = () => setSelectedDate((date) => shiftDate(date, 1))
  const goToToday = () => setSelectedDate(getTodayDateString())

  return {
    selectedDate,
    setSelectedDate,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    bookings,
    isLoading: showLoading,
    isFetching,
    isError,
    error,
    refetch,
    editor,
    openCreate,
    openEdit,
    closeEditor,
    defaultFormValues,
    serverError,
    setServerError,
    createBooking,
    updateBooking,
    deleteBooking,
    isSubmitting,
    pendingDeleteId,
    setPendingDeleteId,
    deleteState,
    isPastSelectedDate,
  }
}

export type BookingPageModel = ReturnType<typeof useBookingPage>
