import { useState } from 'react'
import { Card, Col, Flex, Row, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { Button } from '@/components/Button'
import { BookingForm } from './components/BookingForm'
import { BookingList } from './components/BookingList'
import { BookingTimeline } from './components/BookingTimeline'
import { DateToolbar } from './components/DateToolbar'
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog'
import {
  ErrorPanel,
  LoadingPanel,
  PastDateBanner,
  SelectSlotPanel,
} from './components/StatusPanels'
import { getDefaultEndTime, getErrorMessage } from './utils/helpers'
import { useBookingPage } from './utils/hooks'
import type { Booking } from '@/api/bookings-api-ts/types'
import type { BookingFormValues } from './utils/types'

export function BookingPage() {
  const page = useBookingPage()
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null)

  const selectedId =
    page.editor?.mode === 'edit' ? page.editor.booking.id : undefined

  const handleSubmit = async (values: BookingFormValues) => {
    page.setServerError(null)

    try {
      if (page.editor?.mode === 'edit') {
        await page
          .updateBooking({
            id: page.editor.booking.id,
            date: page.selectedDate,
            start: values.start,
            end: values.end,
            title: values.title.trim(),
          })
          .unwrap()
      } else {
        await page
          .createBooking({
            date: page.selectedDate,
            start: values.start,
            end: values.end,
            title: values.title.trim(),
          })
          .unwrap()
      }
      page.closeEditor()
    } catch (error) {
      page.setServerError(getErrorMessage(error))
      void page.refetch()
    }
  }

  const handleConfirmDelete = async () => {
    if (!bookingToDelete) return
    page.setPendingDeleteId(bookingToDelete.id)
    try {
      await page
        .deleteBooking({
          id: bookingToDelete.id,
          date: page.selectedDate,
        })
        .unwrap()
      if (
        page.editor?.mode === 'edit' &&
        page.editor.booking.id === bookingToDelete.id
      ) {
        page.closeEditor()
      }
      setBookingToDelete(null)
    } catch (error) {
      page.setServerError(getErrorMessage(error, 'Failed to delete booking.'))
      void page.refetch()
    } finally {
      page.setPendingDeleteId(null)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
      <Card className="shadow-sm">
        <DateToolbar
          selectedDate={page.selectedDate}
          onDateChange={page.setSelectedDate}
          onPrevious={page.goToPreviousDay}
          onNext={page.goToNextDay}
          onToday={page.goToToday}
        />
      </Card>

      {page.isPastSelectedDate ? <PastDateBanner /> : null}

      <Flex justify="space-between" align="center" gap={12} wrap>
        <Typography.Text type="secondary" aria-live="polite">
          {page.isFetching && !page.isLoading
            ? 'Refreshing...'
            : `${page.bookings.length} booking${page.bookings.length === 1 ? '' : 's'}`}
        </Typography.Text>
        <Button
          onClick={() => page.openCreate()}
          disabled={page.isPastSelectedDate}
          icon={<PlusOutlined />}
        >
          New booking
        </Button>
      </Flex>

      {page.isLoading ? (
        <LoadingPanel />
      ) : page.isError ? (
        <ErrorPanel
          message={getErrorMessage(page.error, 'Unable to fetch bookings.')}
          onRetry={() => void page.refetch()}
        />
      ) : (
        <Row gutter={[20, 20]} align="stretch">
          <Col xs={24} lg={12}>
            <BookingTimeline
              date={page.selectedDate}
              bookings={page.bookings}
              selectedId={selectedId}
              disabled={page.isPastSelectedDate}
              onSelectBooking={page.openEdit}
              onSelectSlot={(start) => {
                page.openCreate({
                  start,
                  end: getDefaultEndTime(start),
                })
              }}
            />
          </Col>

          <Col xs={24} lg={12}>
            <Flex vertical gap={20} className="h-full">
              {page.editor ? (
                <BookingForm
                  mode={page.editor.mode}
                  date={page.selectedDate}
                  bookings={page.bookings}
                  excludeId={
                    page.editor.mode === 'edit'
                      ? page.editor.booking.id
                      : undefined
                  }
                  defaultValues={page.defaultFormValues}
                  serverError={page.serverError}
                  isSubmitting={page.isSubmitting}
                  onSubmit={handleSubmit}
                  onCancel={page.closeEditor}
                />
              ) : (
                <SelectSlotPanel />
              )}

              <Card
                className="bookings-panel shadow-sm"
                title={
                  <Flex align="center" gap={10}>
                    <span>Bookings</span>
                    <span className="bookings-count">
                      {page.bookings.length}
                    </span>
                  </Flex>
                }
                styles={{
                  header: { padding: '16px 22px', minHeight: 56 },
                  body: { padding: '18px 22px 22px' },
                }}
              >
                <BookingList
                  bookings={page.bookings}
                  selectedId={selectedId}
                  readOnly={page.isPastSelectedDate}
                  deletingId={page.pendingDeleteId}
                  onEdit={page.openEdit}
                  onDelete={setBookingToDelete}
                />
              </Card>
            </Flex>
          </Col>
        </Row>
      )}

      {bookingToDelete ? (
        <DeleteConfirmDialog
          booking={bookingToDelete}
          isDeleting={page.pendingDeleteId === bookingToDelete.id}
          onConfirm={() => void handleConfirmDelete()}
          onCancel={() => setBookingToDelete(null)}
        />
      ) : null}
    </div>
  )
}
